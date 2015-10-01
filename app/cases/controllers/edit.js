'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').controller('Edit', [
    '$scope',
    '$stateParams',
    '$filter',
    '$q',
    '$location',
    'AttachmentsService',
    'CaseService',
    'strataService',
    'HeaderService',
    'RecommendationsService',
    '$rootScope',
    'AUTH_EVENTS',
    'AlertService',
    'securityService',
    'EDIT_CASE_CONFIG',
    'RHAUtils',
    'CASE_EVENTS',
    '$sce',
    'gettextCatalog',
    function ($scope, $stateParams, $filter, $q, $location, AttachmentsService, CaseService, strataService, HeaderService, RecommendationsService, $rootScope, AUTH_EVENTS, AlertService, securityService, EDIT_CASE_CONFIG, RHAUtils, CASE_EVENTS,$sce,gettextCatalog) {
        $scope.EDIT_CASE_CONFIG = EDIT_CASE_CONFIG;
        $scope.securityService = securityService;
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.HeaderService = HeaderService;
        $scope.fromNewCase = false;
        $scope.RecommendationsService = RecommendationsService;
        CaseService.clearCase();
        $scope.loading = {};
        $scope.init = function () {
            AttachmentsService.clear();
            RecommendationsService.clear();
            HeaderService.pageLoadFailure = false;
            $scope.loading.kase = true;
            $scope.recommendationsLoading = true;
            strataService.cases.get($stateParams.id).then(function (resp) {
                HeaderService.pageLoadFailure = false;
                var caseJSON = resp[0];
                var cacheHit = resp[1];
                if (!cacheHit) {
                    CaseService.defineCase(caseJSON);
                } else {
                    CaseService.setCase(caseJSON);
                }
                $rootScope.$broadcast(CASE_EVENTS.received);
                $scope.loading.kase = false;
                if (caseJSON.account_number !== undefined) {
                    strataService.accounts.get(caseJSON.account_number).then(function (account) {
                        CaseService.defineAccount(account);
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                if (EDIT_CASE_CONFIG.showRecommendations) {
                    RecommendationsService.populatePinnedRecommendations();
                    RecommendationsService.getRecommendations(false).then(angular.noop, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                if (EDIT_CASE_CONFIG.showEmailNotifications && !cacheHit) {
                    CaseService.defineNotifiedUsers();
                }
                if($scope.fromNewCase)
                {
                    AlertService.clearAlerts();
                    $scope.fromNewCase = false;
                    var noBusinessHours=gettextCatalog.getString('no business hours');
                    strataService.values.businesshours(securityService.loginStatus.authedUser.timezone).then(function (response) {
                        var availability = "";
                        availability = availability + gettextCatalog.getString('Sunday = {{businessHours}}',{businessHours: ((response.Days.Sunday[0] === "" && response.Days.Sunday[1] === "") ? noBusinessHours :response.Days.Sunday[0] + " - " + response.Days.Sunday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Monday = {{businessHours}}',{businessHours: ((response.Days.Monday[0] === "" && response.Days.Monday[1] === "") ? noBusinessHours :response.Days.Monday[0] + " - " + response.Days.Monday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Tuesday = {{businessHours}}',{businessHours: ((response.Days.Tuesday[0] === "" && response.Days.Tuesday[1] === "") ? noBusinessHours :response.Days.Tuesday[0] + " - " + response.Days.Tuesday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Wednesday = {{businessHours}}',{businessHours: ((response.Days.Wednesday[0] === "" && response.Days.Wednesday[1] === "") ? noBusinessHours :response.Days.Wednesday[0] + " - " + response.Days.Wednesday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Thursday = {{businessHours}}',{businessHours: ((response.Days.Thursday[0] === "" && response.Days.Thursday[1] === "") ? noBusinessHours :response.Days.Thursday[0] + " - " + response.Days.Thursday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Friday = {{businessHours}}',{businessHours: ((response.Days.Friday[0] === "" && response.Days.Friday[1] === "") ? noBusinessHours :response.Days.Friday[0] + " - " + response.Days.Friday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Saturday = {{businessHours}}',{businessHours: ((response.Days.Saturday[0] === "" && response.Days.Saturday[1] === "") ? noBusinessHours :response.Days.Saturday[0] + " - " + response.Days.Saturday[1] + " (" + response.OffsetName + ")")});
                        availability = availability + "<br/>";

                        var message = gettextCatalog.getString("Thank you for contacting Red Hat support!  We'll be in contact soon.  Our records indicate your availability as follows:") +
                            "<br/>" +
                            availability +
                            "<br/>" +
                            gettextCatalog.getString("If we have not recorded your business hours correctly, please update your timezone in  <a href=\'/wapps/ugc/protected/locale.html\' target=\'_blank\'>Your preferences</a>");
                        var parsedHtml = $sce.trustAsHtml(message);
                        AlertService.addInfoMessage(parsedHtml);

                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });

                }

            }, function (error) {
                HeaderService.pageLoadFailure = true;
            });
            if (window.chrometwo_require !== undefined) {
                breadcrumbs = [
                    ['Support', '/support/'],
                    ['Support Cases',  '/support/cases/'],
                    [$stateParams.id]
                ];
                updateBreadCrumb();
            }
        };

        $scope.firePageLoadEvent = function () {
            if (window.chrometwo_require !== undefined) {
                chrometwo_require(['analytics/attributes', 'analytics/main'], function(attrs, paf) {
                    attrs.harvest();
                    paf.report();
                });
            }
        };

        if (securityService.loginStatus.isLoggedIn) {
            $scope.firePageLoadEvent();
            $scope.init();
        }
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            $scope.firePageLoadEvent();
            $scope.init();
        });

        var caseSettled = function() {
            $scope.$broadcast('rhaCaseSettled');
        };

        $scope.loadingWatcher = $scope.$watch('loading', function(loadingObj){
            if($.isEmptyObject(loadingObj)) {
                return;
            }
            var allLoaded = true;
            for (var key in loadingObj) {
                if(loadingObj[key] !== false) {
                    allLoaded = false;
                }
            }
            if(allLoaded && !HeaderService.pageLoadFailure) {
                caseSettled();
            }
        }, true);

        $scope.loadingRecWatcher = $scope.$watch('recommendationsLoading', function(newVal) {
            if(newVal === false) {
                caseSettled();
            }
        });

        $scope.$on('$locationChangeSuccess', function(){
            var splitUrl = $location.path().split('/');
            if(splitUrl[2] !== undefined && $location.path().search(/case\/[0-9]{1,8}/i) !== -1){
                var newCaseId = splitUrl[2];
                var oldCaseId = $scope.CaseService.kase.case_number;
                if(newCaseId !== oldCaseId){
                    $stateParams.id = newCaseId;
                    CaseService.clearCase();
                    $scope.init();
                }
            }
        });
        $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            if(from.url === '/case/new'){
                $scope.fromNewCase = true;
            }
        });
    }
]);
