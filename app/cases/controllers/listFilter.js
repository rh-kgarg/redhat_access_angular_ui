'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').controller('ListFilter', [
    '$scope',
    'STATUS',
    'CaseService',
    'securityService',
    '$rootScope',
    'CASE_EVENTS',
    'COMMON_CONFIG',
    'SearchCaseService',
    'GroupService',
    'ConstantsService',
    'RHAUtils',
    function ($scope, STATUS, CaseService, securityService, $rootScope, CASE_EVENTS, COMMON_CONFIG, SearchCaseService, GroupService, ConstantsService, RHAUtils) {
        $scope.securityService = securityService;
        $scope.CaseService = CaseService;
        $scope.GroupService = GroupService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.ConstantsService = ConstantsService;
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        CaseService.status = STATUS.open;
        $scope.showsearchoptions = CaseService.showsearchoptions;
        $scope.doSearch = function(){
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        }
        $scope.setSearchOptions = function (showsearchoptions) {
            CaseService.showsearchoptions = showsearchoptions;
            CaseService.buildGroupOptions();            
        };
        $scope.clearSearch = function () {
            SearchCaseService.caseParameters.searchTerm = undefined;
        };
    }
]);