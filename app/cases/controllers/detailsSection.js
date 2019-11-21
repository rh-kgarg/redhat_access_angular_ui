'use strict';

export default class DetailsSection {
    constructor($scope, $filter, $location, strataService, CaseService, securityService, ProductsService, CASE_EVENTS, AlertService, RHAUtils, LinkifyService, gettextCatalog, SearchCaseService, COMMON_CONFIG) {
        'ngInject';

        $scope.showExtraInfo = false;
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.CaseService = CaseService;
        $scope.ProductsService = ProductsService;
        $scope.securityService = securityService;
        $scope.maxNotesLength = '255';
        $scope.progressCount = 0;
        $scope.caseSummaryEditable = false;
        $scope.caseDescriptionEditable = false;
        $scope.contactList = [];
        $scope.caseContactSelected = true;
        $scope.maxLength = 450;
        $scope.noEnhancedSLAMessage = gettextCatalog.getString("There are no remaining enhanced SLA's available");
        $scope.doNotDisableOnEditSLA = CaseService.kase.enhanced_sla && !CaseService.account.has_available_enhanced_sla;
        $scope.toggleExtraInfo = function () {
            $scope.showExtraInfo = !$scope.showExtraInfo;

        };

        // $scope.showSbrGroups = () => {
        //     return COMMON_CONFIG.isGS4 && RHAUtils.isNotEmpty(CaseService.kase.sbr_groups.sbr_group) && securityService.loginStatus.authedUser.is_internal;
        // };

        $scope.resetData = function () {
            CaseService.resetCase();
            ProductsService.getVersions(CaseService.kase.product);
            $scope.detailsForm.$setPristine();
        };

        $scope.init = function () {
            const remoteSessionFlag = $location.search().remoteSessionTermsAcked;
            // in a queryparam everything is a string
            if (remoteSessionFlag === "true") {
                AlertService.addSuccessMessage(gettextCatalog.getString('The remote session terms have been acknowledged'));
                $location.search('remoteSessionTermsAcked', null);
                $location.search('remoteSessionTermsAckedDate', null);
            }
            else if (remoteSessionFlag === "false") {
                AlertService.addDangerMessage(gettextCatalog.getString('The remote session terms have not been acknowledged'));
                $location.search('remoteSessionTermsAcked', null);
                $location.search('remoteSessionTermsAckedDate', null);
            }
            if (!$scope.compact) {
                strataService.values.cases.types().then(function (response) {
                    $scope.caseTypes = response;
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                });
                var contact = securityService.loginStatus.authedUser.sso_username;
                if (RHAUtils.isNotEmpty(CaseService.kase.contact_sso_username)) {
                    contact = CaseService.kase.contact_sso_username; // When internal user views case of another account
                }

                if (CaseService.kase.contact_is_partner && (securityService.loginStatus.authedUser.org_admin || CaseService.isManagedAccount(CaseService.kase.account_number))) {
                    strataService.accounts.users(CaseService.kase.account_number).then((users) => {
                        contact = _.first(_.filter(users, (user) => user.org_admin));
                        CaseService.virtualOwner = contact.sso_username;
                        strataService.groups.list(contact.sso_username).then(function (response) {
                            $scope.groups = response;
                        }, function (error) {
                            AlertService.addStrataErrorMessage(error);
                        });
                        ProductsService.getProducts(false);
                    }, (error) => {
                        AlertService.addStrataErrorMessage(error);
                    });
                } else {
                    strataService.groups.list(contact).then(function (response) {
                        $scope.groups = response;
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                    ProductsService.getProducts(false);
                }
            }
            if (securityService.loginStatus.authedUser.is_internal && COMMON_CONFIG.isGS4 && RHAUtils.isEmpty(CaseService.redhatSecureSupportUsers)) {
                CaseService.populateRedhatSecureSupportUsers();
            }

            strataService.values.cases.status().then(function (response) {
                CaseService.statuses = response;
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });

            strataService.values.cases.severity().then(function (response) {
                CaseService.setSeverities(response);
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            $scope.userIsCaseOwner = true;
            var ownerOptions = [];
            //Assuming the full name matches the owner name, strata does not support getting that through case object
            var fullName = securityService.loginStatus.authedUser.first_name + ' ' + securityService.loginStatus.authedUser.last_name;
            if (fullName !== CaseService.kase.owner && securityService.loginStatus.authedUser.is_internal) {
                $scope.userIsCaseOwner = false;
                ownerOptions.push({
                    value: securityService.loginStatus.authedUser.sso_username,
                    label: fullName
                }, {
                    value: CaseService.kase.owner,
                    label: CaseService.kase.owner
                });
            }
            $scope.owners = ownerOptions;
            $scope.fetchPossibleContacts();
        };


        $scope.$watch('CaseService.kase.notes', function () {
            $scope.maxCharacterCheck();
        });
        $scope.maxCharacterCheck = function () {

            if (CaseService.kase.notes !== undefined) {

                $scope.progressCount = CaseService.kase.notes.length;
            }
        };

        $scope.updatingDetails = false;
        $scope.updateCase = function () {
            $scope.updatingDetails = true;
            if (CaseService.kase !== undefined) {
                if ($scope.caseContactSelected) {
                    CaseService.updateCase().then(function () {
                        $scope.updatingDetails = false;
                        $scope.caseSummaryEditable = false;
                        $scope.detailsForm.$setPristine();
                        $scope.summaryForm.$setPristine();
                        SearchCaseService.clear();
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                        $scope.updatingDetails = false;
                    });
                } else {
                    var errorMessage = gettextCatalog.getString("A Case Contact must be selected to update case");
                    AlertService.addDangerMessage(errorMessage);
                    $scope.updatingDetails = false;
                }
            } else {
                if ($scope.caseDetails.owner !== undefined && $scope.caseDetails.owner.$dirty) {
                    $scope.changeCaseOwner();
                }
            }
        };
        $scope.updateCaseDescription = function () {
            $scope.updatingDetails = true;
            if (CaseService.kase !== undefined) {
                CaseService.updateCaseDescription().then(function () {
                    $scope.updatingDetails = false;
                    $scope.caseDescriptionEditable = false;
                    $scope.descriptionForm.$setPristine();
                    SearchCaseService.clear();
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                    $scope.updatingDetails = false;
                });
            }
        };
        $scope.changeCaseOwner = function () {
            strataService.cases.owner.update(CaseService.kase.case_number, CaseService.kase.owner).then(function () {
                CaseService.kase.owner = securityService.loginStatus.authedUser.first_name + ' ' + securityService.loginStatus.authedUser.last_name;
                $scope.userIsCaseOwner = true;
                $scope.updatingDetails = false;
                $scope.caseDetails.$setPristine();
                if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                    $scope.$apply();
                }
                SearchCaseService.clear();
            }, function (error) {
                $scope.updatingDetails = false;
                AlertService.addStrataErrorMessage(error);
            });
        };
        $scope.caseDetailsChanged = function () {
            if ($scope.caseDetails.alternate_id.$dirty || $scope.caseDetails.product.$dirty
                || $scope.caseDetails.version.$dirty || $scope.caseDetails.group.$dirty
                || $scope.caseDetails.hostname.$dirty) {
                return true;
            } else {
                return false;
            }
        };
        $scope.editCaseSummary = function (editSummary) {
            if (editSummary === true) {
                $scope.caseSummaryEditable = true;
            } else {
                CaseService.kase.summary = CaseService.prestineKase.summary;
                $scope.caseSummaryEditable = false;
            }

        };
        $scope.editCaseDescription = function (editDescription) {
            if (editDescription === true) {
                $scope.caseDescriptionEditable = true;
            } else {
                CaseService.kase.description = CaseService.prestineKase.description;
                $scope.caseDescriptionEditable = false;
            }

        };
        $scope.fetchPossibleContacts = function () {
            if (RHAUtils.isNotEmpty(CaseService.kase.group) && RHAUtils.isNotEmpty(CaseService.kase.group.number) && RHAUtils.isNotEmpty(CaseService.account.number) && securityService.loginStatus.authedUser.org_admin) {
                strataService.accounts.users(CaseService.account.number, CaseService.kase.group.number).then(angular.bind(this, function (group) {
                    if (CaseService.kase.group.number === "-1") {
                        $scope.contactList = group;
                    } else {
                        $scope.contactList = $filter('filter')(group, { write: true });
                    }


                    strataService.accounts.users(securityService.loginStatus.authedUser.account_number).then(angular.bind(this, function (users) {
                        $scope.contactList = _.uniq($scope.contactList.concat(users));
                        // add case contact in the list if it is not present.
                        if (!_.find($scope.contactList, (list) => list && list.sso_username === CaseService.kase.contact_sso_username)) {
                            $scope.contactList.push({
                                sso_username: CaseService.kase.contact_sso_username,
                                fullName: CaseService.kase.contact_name
                            });
                        }
                        $scope.caseContactSelected = true;
                        var listContainsUser = false;
                        for (var i = 0; i < $scope.contactList.length; i++) {
                            if ($scope.contactList[i].sso_username === CaseService.kase.contact_sso_username) {
                                listContainsUser = true;
                                break;
                            }
                        }
                        if (!listContainsUser) {
                            $scope.caseContactSelected = false;
                        }
                        $scope.contactList = _.uniqBy($scope.contactList, 'sso_username');
                    }), function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });

                    $scope.contactList = _.uniqBy($scope.contactList, 'sso_username');
                }), function (error) {
                    if (error.xhr.status === 403) {
                        AlertService.addDangerMessage(gettextCatalog.getString('Error: Selected Case Group does not belong to your account'));
                    } else {
                        AlertService.addStrataErrorMessage(error);
                    }
                });
            } else {
                $scope.contactList = CaseService.users;
                if (securityService.loginStatus.authedUser.org_admin) {
                    strataService.accounts.users(securityService.loginStatus.authedUser.account_number).then(angular.bind(this, function (users) {
                        $scope.contactList = _.uniq($scope.contactList.concat(users));
                        // add case contact in the list if it is not present.
                        if (!_.find($scope.contactList, (list) => list && list.sso_username === CaseService.kase.contact_sso_username)) {
                            $scope.contactList.push({
                                sso_username: CaseService.kase.contact_sso_username,
                                fullName: CaseService.kase.contact_name
                            });
                        }
                        $scope.caseContactSelected = true;
                        var listContainsUser = false;
                        for (var i = 0; i < $scope.contactList.length; i++) {
                            if ($scope.contactList[i].sso_username === CaseService.kase.contact_sso_username) {
                                listContainsUser = true;
                                break;
                            }
                        }
                        if (!listContainsUser) {
                            $scope.caseContactSelected = false;
                        }
                        $scope.contactList = _.uniqBy($scope.contactList, 'sso_username');
                    }), function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                } else if (!securityService.loginStatus.authedUser.org_admin && CaseService.isManagedAccount(CaseService.kase.account_number)) {
                    strataService.accounts.users(CaseService.kase.account_number).then(angular.bind(this, function (users) {
                        $scope.contactList = $scope.contactList.concat(users);
                        const loggedInUser = _.pick(securityService.loginStatus.authedUser, ['sso_username', 'first_name', 'last_name']);

                        $scope.contactList.unshift(loggedInUser);
                        // add case contact in the list if it is not present.
                        if (!_.find($scope.contactList, (list) => list && list.sso_username === CaseService.kase.contact_sso_username)) {
                            $scope.contactList.push({
                                sso_username: CaseService.kase.contact_sso_username,
                                fullName: CaseService.kase.contact_name
                            });
                        }
                        $scope.contactList = _.uniqBy($scope.contactList, 'sso_username');

                        $scope.caseContactSelected = true;
                        var listContainsUser = false;
                        for (var i = 0; i < $scope.contactList.length; i++) {
                            if ($scope.contactList[i].sso_username === CaseService.kase.contact_sso_username) {
                                listContainsUser = true;
                                break;
                            }
                        }
                        if (!listContainsUser) {
                            $scope.caseContactSelected = false;
                        }

                    }), function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
            }
        };
        $scope.$watch('CaseService.users', function () {
            $scope.fetchPossibleContacts();
        });
        $scope.$watch('CaseService.account', function () {
            $scope.fetchPossibleContacts();
        });
        $scope.contactSelected = function () {
            $scope.caseContactSelected = true;
        };
        $scope.validatePage = function () {
            if (ProductsService.versionLoading) {
                return true;
            } else {
                if (RHAUtils.isEmpty(CaseService.kase.product) || RHAUtils.isEmpty(CaseService.kase.version) || RHAUtils.isEmpty(CaseService.kase.summary)) {
                    return true;
                } else if (RHAUtils.isNotEmpty(CaseService.kase.version) && (ProductsService.versions.indexOf(CaseService.kase.version) === -1)) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        if (CaseService.caseDataReady) {
            $scope.init();
        }
        $scope.$on(CASE_EVENTS.received, function () {
            $scope.init();
            //AlertService.clearAlerts();
        });

        $scope.getDescription = function (maxLength) {
            var text = CaseService.kase.description;
            if (maxLength !== undefined) text = $filter('substring')(text, maxLength);
            text = $scope.htmlEntitiesEncode(text);
            return LinkifyService.linkifyBZIDs(LinkifyService.linkifyWithCaseIDs(text));
        };
        $scope.onCaseTypeChanged = function () {
            CaseService.onSelectChanged();
        };

        $scope.htmlEntitiesEncode = function (text) {
            return text && String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
    }
}
