'use strict';

export default class ListFilter {
    constructor($scope, STATUS, ProductsService, CaseService, securityService, $rootScope, gettextCatalog, RHAUtils, CASE_EVENTS, AlertService, SearchCaseService, GroupService, ConstantsService, $state, COMMON_CONFIG) {
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.securityService = securityService;
        $scope.CaseService = CaseService;
        $scope.GroupService = GroupService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.ConstantsService = ConstantsService;
        CaseService.status = STATUS.open;
        $scope.showsearchoptions = CaseService.showsearchoptions;
        $scope.bookmarkAccountUrl = $state.href('accountBookmark');

        $scope.doSearch = function () {
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        $scope.setSearchOptions = function (showsearchoptions) {
            CaseService.showsearchoptions = showsearchoptions;
            CaseService.buildGroupOptions();
        };
        $scope.clearSearch = function () {
            SearchCaseService.searchParameters.searchString = undefined;
        };
    }
}
