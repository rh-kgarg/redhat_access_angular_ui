'use strict';
/*jshint camelcase: false*/
angular.module('RedhatAccess.cases').controller('New', [
    '$scope',
    '$state',
    '$q',
    '$timeout',
    '$sanitize',
    '$modal',
    '$sce',
    'SearchResultsService',
    'AttachmentsService',
    'strataService',
    'RecommendationsService',
    'CaseService',
    'AlertService',
    'HeaderService',
    'ProductsService',
    'securityService',
    'AUTH_EVENTS',
    '$location',
    'RHAUtils',
    'NEW_DEFAULTS',
    'NEW_CASE_CONFIG',
    'COMMON_CONFIG',
    'CASE_EVENTS',
    'gettextCatalog',
    function ($scope, $state, $q, $timeout, $sanitize, $modal, $sce, SearchResultsService, AttachmentsService, strataService, RecommendationsService, CaseService, AlertService, HeaderService, ProductsService, securityService, AUTH_EVENTS, $location, RHAUtils, NEW_DEFAULTS, NEW_CASE_CONFIG, COMMON_CONFIG, CASE_EVENTS, gettextCatalog) {
        $scope.NEW_CASE_CONFIG = NEW_CASE_CONFIG;
        $scope.versions = [];
        $scope.versionDisabled = true;
        $scope.versionLoading = false;
        $scope.incomplete = true;
        $scope.submitProgress = 0;
        $scope.AttachmentsService = AttachmentsService;
        CaseService.clearCase();
        RecommendationsService.clear();
        SearchResultsService.clear();
        $scope.CaseService = CaseService;
        $scope.RecommendationsService = RecommendationsService;
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.securityService = securityService;
        $scope.HeaderService = HeaderService;
        $scope.ie8 = window.ie8;
        $scope.ie9 = window.ie9;
        $scope.ie8Message='We’re unable to accept file attachments from Internet Explorer 8 (IE8) at this time. Please see our instructions for providing files <a href=\"https://access.redhat.com/solutions/2112\" target="_blank\">via FTP </a> in the interim.';

        $scope.showRecommendationPanel = false;
        $scope.notifiedUsers = [];
        $scope.isControlGroup = true;
        $scope.recommendationsPerPage = 3;
	    //$scope.hideSticky = false;

        // Instantiate these variables outside the watch
        var waiting = false;
        $scope.$watch('CaseService.kase.product + CaseService.kase.version + CaseService.kase.description + CaseService.kase.summary', function () {
            if (!waiting) {
                var descriptionText = CaseService.kase.problem + ' ' + CaseService.kase.environment + ' ' + CaseService.kase.occurance + ' ' + CaseService.kase.urgency;
                if (RHAUtils.isNotEmpty(CaseService.kase.product) || RHAUtils.isNotEmpty(CaseService.kase.version) || RHAUtils.isNotEmpty(descriptionText) || RHAUtils.isNotEmpty(CaseService.kase.summary)) {
                    if (RHAUtils.isNotEmpty(descriptionText) || RHAUtils.isNotEmpty(CaseService.kase.summary)) {
                        $scope.makeRecommendationPanelVisible();
                    }
                    waiting = true;
                    var descriptionText = CaseService.kase.description;
                    if (RHAUtils.isNotEmpty(CaseService.kase.problem) && CaseService.kase.problem.length > 0) {
                        descriptionText = CaseService.kase.problem;
                    }
                    if (RHAUtils.isNotEmpty(CaseService.kase.environment) && CaseService.kase.environment.length > 0) {
                        if (RHAUtils.isNotEmpty(CaseService.kase.description)) {
                            descriptionText = descriptionText.concat(' ');
                        }
                        descriptionText = descriptionText.concat(CaseService.kase.environment);
                    }
                    if (RHAUtils.isNotEmpty(CaseService.kase.occurance) && CaseService.kase.occurance.length > 0) {
                        if (RHAUtils.isNotEmpty(CaseService.kase.description)) {
                            descriptionText = descriptionText.concat(' ');
                        }
                        descriptionText = descriptionText.concat(CaseService.kase.occurance);
                    }
                    if (RHAUtils.isNotEmpty(CaseService.kase.urgency) && CaseService.kase.urgency.length > 0) {
                        if (RHAUtils.isNotEmpty(CaseService.kase.description)) {
                            descriptionText = descriptionText.concat(' ');
                        }
                        descriptionText = descriptionText.concat(CaseService.kase.urgency);
                    }
                    var recommendationsText = {
                        product: CaseService.kase.product,
                        version: CaseService.kase.version,
                        summary: CaseService.kase.summary,
                        description: descriptionText
                    };
                    $timeout(function() {
                        waiting = false;
                        RecommendationsService.getRecommendations(true, 6, recommendationsText);
                    }, 500); // delay 500 ms
                }
            }
        });


        $scope.$on(CASE_EVENTS.ownerChange, function () {
            if (CaseService.owner !== undefined) {
                CaseService.populateEntitlements(CaseService.owner);
                CaseService.populateGroups(CaseService.owner);
                ProductsService.getProducts(true);

                //as owner change, we might get different product and version list, so better to clear previous selection
                CaseService.clearProdVersionFromLS();
            }
        });

        /**
       * Populate the selects
       */
        $scope.initSelects = function () {
            AttachmentsService.clear();
            CaseService.newCaseIncomplete = true;
            CaseService.clearCase();
            RecommendationsService.clear();
            ProductsService.clear();
            CaseService.populateUsers().then(function () {
                $scope.usersOnAccount = CaseService.users;
                $scope.usersOnAccount = $scope.usersOnAccount.map(function(obj) {
                    return obj.sso_username;
                });
                var index = $scope.usersOnAccount.indexOf(securityService.loginStatus.authedUser.sso_username);
                if (index > -1) {
                    $scope.usersOnAccount.splice(index, 1);
                }
            });
            $scope.severitiesLoading = true;
            ProductsService.getProducts(false);
            CaseService.populateEntitlements(securityService.loginStatus.authedUser.sso_username);
            strataService.values.cases.severity().then(function (severities) {
                CaseService.severities = severities;
                CaseService.kase.severity = severities[severities.length - 1];
                $scope.severitiesLoading = false;
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            $scope.groupsLoading = true;
            CaseService.populateGroups().then(function (groups) {
                $scope.groupsLoading = false;
            }, function (error) {
                AlertService.addStrataErrorMessage(error);
            });
            if (window.chrometwo_require !== undefined) {
                breadcrumbs = [
                    ['Support', '/support/'],
                    ['Support Cases',  '/support/cases/'],
                    ['New']
                ];
                updateBreadCrumb();
            }
            if(!$scope.isControlGroup){
                $scope.recommendationsPerPage = 6;
            }
        };
        $scope.initDescription = function () {
            var searchObject = $location.search();
            if (RHAUtils.isNotEmpty(CaseService.localStorageCache) && CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username)) {
                CaseService.kase.description = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).text;
                CaseService.kase.problem = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).problem;
                CaseService.kase.environment = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).environment;
                CaseService.kase.occurance = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).occurance;
                CaseService.kase.urgency = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).urgency;
            }
            var setDesc = function (desc) {
                CaseService.kase.description = desc;
                $scope.getRecommendations();
            };
            if (!$scope.NEW_CASE_CONFIG.isPCM) {
                if (searchObject.data) {
                    setDesc(searchObject.data);
                } else {
                    //angular does not  handle params before hashbang
                    //@see https://github.com/angular/angular.js/issues/6172
                    var queryParamsStr = window.location.search.substring(1);
                    var parameters = queryParamsStr.split('&');
                    for (var i = 0; i < parameters.length; i++) {
                        var parameterName = parameters[i].split('=');
                        if (parameterName[0] === 'data') {
                            setDesc(decodeURIComponent(parameterName[1]));
                        }
                    }
                }
            }
        };

        $scope.getLocalStorageForNewCase = function() {
            if (RHAUtils.isNotEmpty(CaseService.localStorageCache) && CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username)) {
                var draftNewCase = CaseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username).text;
                CaseService.kase.description = draftNewCase.description;
                CaseService.kase.problem = draftNewCase.problem;
                CaseService.kase.environment = draftNewCase.environment;
                CaseService.kase.occurance = draftNewCase.occurance;
                CaseService.kase.urgency = draftNewCase.urgency;
                CaseService.kase.summary = draftNewCase.summary;
                if (RHAUtils.isNotEmpty(draftNewCase.product)) {
                    //if we directly call $scope.getProductVersions function without product list in strata service it return error
                    strataService.products.list(CaseService.owner).then(function (products) {
                        CaseService.kase.product = draftNewCase.product;
                        ProductsService.getVersions(CaseService.kase.product);
                        CaseService.kase.version = draftNewCase.version; //setting version after product check, as without product, version don't have any meaning
                        CaseService.validateNewCase();
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
            }
        };

        $scope.getNewCaseFromQueryParams = function() {
            var search = $location.search();
            if (search.summary) {
                CaseService.kase.summary = search.summary;
            }
            if (search.description && search.b64) {
                try {
                    // Note: IE8&9 do not have atob - we tried our best
                    CaseService.kase.description = atob(search.description);
                } catch(e) {}
            } else if (search.description) {
                CaseService.kase.description = search.description;
            }
        };

        $scope.ABTestRegister = function() {

            var urlParameter = $location.search();

            if(!urlParameter.abtest){
                if (securityService.loginStatus.authedUser.account_number !== undefined) {
                    var testgroup = '';
                    if (securityService.loginStatus.authedUser.account_number % 2 === 1) {
                        testgroup = 'ABTestControl';
                        $scope.isControlGroup = true;
                    } else{
                        testgroup = 'ABTestChallenger';
                        $scope.isControlGroup = false;
                    }
                    if (window.chrometwo_require !== undefined) {
                        chrometwo_require(['analytics/attributes', 'analytics/main'], function(attrs, paf) {
                            paf.trigger('ABTestImpression');
                            attrs.set('ABTestCampaign', ['ABTestTitle', testgroup]);
                            attrs.harvest();
                            paf.report();
                        });
                    }
                }
            } else {
                $scope.isControlGroup = !(urlParameter.abtest === 'true');
            }
        };

        function scopeInit() {
            $scope.ABTestRegister();
            $scope.initSelects();
            $scope.initDescription();
            $scope.getLocalStorageForNewCase();
            $scope.getNewCaseFromQueryParams();
        }

        if (securityService.loginStatus.isLoggedIn) {
            scopeInit();
        }
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            scopeInit();
            //AlertService.clearAlerts();
            RecommendationsService.failureCount = 0;
        });

        $scope.submittingCase = false;

        $scope.setSearchOptions = function (showsearchoptions) {
            CaseService.showsearchoptions = showsearchoptions;
            if (CaseService.groups.length === 0) {
                CaseService.populateGroups().then(function () {
                    CaseService.buildGroupOptions();
                });
            } else{
                CaseService.buildGroupOptions();
            }
        };

        $scope.scrollToRecommendations = function() {
            var recommendationsSection = document.getElementById('recommendations_section');
            if (recommendationsSection) {
                recommendationsSection.scrollIntoView(true);
            }
        };

        /**
       * Create the case with attachments
       */
        $scope.doSubmit = function ($event) {
            AttachmentsService.proceedWithoutAttachments = false;

            var redirectToCase = function (caseNumber) {
                $state.go('edit', { id: caseNumber });
                AlertService.clearAlerts();
                CaseService.submittingCase = false;
            };

            var caseUploadsAndUpdates = function(caseNumber) {
                if (window.chrometwo_require !== undefined) {
                    chrometwo_require(['analytics/main'], function (analytics) {
                        analytics.trigger('OpenSupportCaseSubmit', $event);
                    });
                }
                angular.forEach($scope.notifiedUsers, function (user) {
                    var userMessage = AlertService.addWarningMessage(gettextCatalog.getString('Adding user {{userName}} to case.',{userName:user}));
                    strataService.cases.notified_users.add(caseNumber, user).then(function () {
                        AlertService.removeAlert(userMessage);
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                });

                if ((AttachmentsService.updatedAttachments.length > 0 || AttachmentsService.hasBackEndSelections()) && NEW_CASE_CONFIG.showAttachments) {
                    AttachmentsService.updateAttachments(caseNumber).then(function () {
                        redirectToCase(caseNumber);
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                        CaseService.submittingCase = false;
                    });
                } else if (NEW_CASE_CONFIG.showAttachments && $scope.ie8 || $scope.ie9 ) {
                    var fileName = document.getElementById('newFileUploader').value;
                    if (RHAUtils.isNotEmpty(fileName)) {
                        $scope.ieFileUpload(caseNumber);
                    } else {
                        redirectToCase(caseNumber);
                    }
                } else {
                    redirectToCase(caseNumber);
                }
            };

            if(AttachmentsService.updatedAttachments.length === 0 && !$scope.ie8 && !$scope.ie9 && securityService.loginStatus.authedUser.can_add_attachments && !COMMON_CONFIG.isGS4){
                var proceedWithoutAttachModal = $modal.open({
                    templateUrl: 'cases/views/proceedWithoutAttachModal.html',
                    controller: 'ProceedWithoutAttachModal'
                });
                proceedWithoutAttachModal.result.then(function() {
                    if (AttachmentsService.proceedWithoutAttachments) {
                        CaseService.createCase().then(function (caseNumber) {
                            caseUploadsAndUpdates(caseNumber);
                        }, function (error) {
                            AlertService.addStrataErrorMessage(error);
                            CaseService.submittingCase = false;
                        });
                    }
                });
            } else {
                CaseService.createCase().then(function (caseNumber) {
                    caseUploadsAndUpdates(caseNumber);
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                    CaseService.submittingCase = false;
                });
            }
        };

        $scope.getLocatingSolutionText = function() {
            var text = 'Locating top solutions';
            var numFieldsSelected = 0;
            if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                text = text.concat(' for ' + CaseService.kase.product);
                numFieldsSelected++;
            }
            if (RHAUtils.isNotEmpty(CaseService.kase.version)) {
                text = text.concat(' ' + CaseService.kase.version);
                numFieldsSelected++;
            }
            if (RHAUtils.isNotEmpty(CaseService.kase.summary)) {
                numFieldsSelected++;
            }
            if (RHAUtils.isNotEmpty(CaseService.kase.description)) {
                numFieldsSelected++;
            }

            if (numFieldsSelected > 2) {
                text = text.replace('Locating', 'Refining');
            }
            if (text.indexOf('Locating') !== -1) {
                text = gettextCatalog.getString('Locating top solutions');
            } else {
                text = gettextCatalog.getString('Refining top solutions');
            }
            return text;
        };

        $scope.ieFileUpload = function(caseNumber) {
            var form = document.getElementById('fileUploaderForm');
            var iframeId = document.getElementById('upload_target');
            form.action = 'https://' + window.location.host + '/rs/cases/' + caseNumber + '/attachments';

            var redirectToCase = function (caseNumber) {
                $state.go('edit', { id: caseNumber });
                AlertService.clearAlerts();
                CaseService.submittingCase = false;
            };

            var eventHandler = function () {
                if (iframeId.detachEvent) {
                    iframeId.detachEvent('onload', eventHandler);
                }
                if (iframeId.removeEventListener) {
                    iframeId.removeEventListener('load', eventHandler, false);
                }
                if (!$scope.ie8) {
                    var content;
                    if (iframeId.contentDocument && iframeId.contentDocument.body !== null) {
                        content = iframeId.contentDocument.body.innerText;
                    } else if (iframeId.contentWindow && iframeId.contentWindow.document.body !== null) {
                        content = iframeId.contentWindow.document.body.innerText;
                    }
                    if (content !== undefined && content.length) {
                        var parser = document.createElement('a');
                        parser.href = content;
                        var splitPath = parser.pathname.split('/');
                        if (splitPath !== undefined && splitPath[4] !== undefined) {
                            redirectToCase(caseNumber);
                            $scope.$apply();
                        } else {
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}',{errorMessage:content}));
                            redirectToCase(caseNumber);
                            $scope.$apply();
                        }
                    } else {
                        AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}',{errorMessage:content}));
                        redirectToCase(caseNumber);
                        $scope.$apply();
                    }
                }else {
                    redirectToCase(caseNumber);
                    $scope.$apply();
                }
                AlertService.removeAlert(uploadingAlert);
            };

            if (iframeId.addEventListener) {
                iframeId.addEventListener('load', eventHandler, true);
            } else if (iframeId.attachEvent) {
                iframeId.attachEvent('onload', eventHandler);
            }
            var uploadingAlert = AlertService.addWarningMessage(gettextCatalog.getString('Uploading attachment...'));
            form.submit();
        };

        $scope.$on(AUTH_EVENTS.logoutSuccess, function () {
            CaseService.clearCase();
        });

        $scope.makeRecommendationPanelVisible = function() {
            $scope.showRecommendationPanel = true;
        };

        $scope.updateDescriptionString = function(){
            CaseService.kase.description = '';
            if(RHAUtils.isNotEmpty(CaseService.kase.problem) && CaseService.kase.problem.length > 0){
                CaseService.kase.description = CaseService.problemString + '\n\n' + CaseService.kase.problem;
            }
            if(RHAUtils.isNotEmpty(CaseService.kase.environment) && CaseService.kase.environment.length > 0){
                if(RHAUtils.isNotEmpty(CaseService.kase.description)){
                    CaseService.kase.description = CaseService.kase.description.concat('\n\n');
                }
                CaseService.kase.description = CaseService.kase.description.concat(CaseService.environmentString + '\n\n' + CaseService.kase.environment);
            }
            if(RHAUtils.isNotEmpty(CaseService.kase.occurance) && CaseService.kase.occurance.length > 0){
                if(RHAUtils.isNotEmpty(CaseService.kase.description)){
                    CaseService.kase.description = CaseService.kase.description.concat('\n\n');
                }
                CaseService.kase.description = CaseService.kase.description.concat(CaseService.occuranceString + '\n\n' + CaseService.kase.occurance);
            }
            if(RHAUtils.isNotEmpty(CaseService.kase.urgency) && CaseService.kase.urgency.length > 0){
                if(RHAUtils.isNotEmpty(CaseService.kase.description)){
                    CaseService.kase.description = CaseService.kase.description.concat('\n\n');
                }
                CaseService.kase.description = CaseService.kase.description.concat(CaseService.urgencyString + '\n\n' + CaseService.kase.urgency);
            }
        };
    }
]);
