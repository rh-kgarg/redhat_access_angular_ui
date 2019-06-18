'use strict';

import remove from 'lodash/remove';
import cloneDeep from "lodash/cloneDeep";

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

        function init() {
            if (RHAUtils.isEmpty(ProductsService.products)) {
                ProductsService.getProducts(false);
            }
        }
        init();

        $scope.$watch('securityService.loginStatus.authedUser', (nv) => {
            if (nv && nv.loggedInUser) {
                CaseService.populateUsers();
            }
        });

        $scope.$watch('CaseService.kase.product', () => {
            if (RHAUtils.isNotEmpty(CaseService.kase.product) && CaseService.kase.product !== 'all') {
                if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                    SearchCaseService.searchParameters.queryParams = [];
                }

                SearchCaseService.searchParameters.queryParams.push(`case_product:"${CaseService.kase.product}"`);
            } else {
                remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_product:'));
                remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:'));
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        });

        $scope.$watch('CaseService.kase.version', () => {
            if (RHAUtils.isNotEmpty(CaseService.kase.version)){
                SearchCaseService.searchParameters.queryParams.push(`case_version:"${CaseService.kase.version}"`);
            } else {
                remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:'));
            }

            if (CaseService.kase.product) {
                $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
            }
        });

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
