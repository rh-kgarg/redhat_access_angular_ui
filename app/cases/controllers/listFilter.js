'use strict';

import remove from 'lodash/remove';

export default class ListFilter {
    constructor($scope, STATUS, ProductsService, CaseService, securityService, $rootScope, gettextCatalog, RHAUtils, CASE_EVENTS, AlertService, SearchCaseService, GroupService, ConstantsService, $state, COMMON_CONFIG) {
        let isFilterInitialized = false;
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
            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:') || v.includes('case_product:'));

            if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                SearchCaseService.searchParameters.queryParams = [];
            }

            if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                SearchCaseService.searchParameters.queryParams.push(`case_product:"${CaseService.kase.product}"`);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        });

        $scope.$watch('CaseService.kase.version', () => {
            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:'));

            if (RHAUtils.isNotEmpty(CaseService.kase.version)){
                SearchCaseService.searchParameters.queryParams.push(`case_version:"${CaseService.kase.version}"`);
            }

            if (CaseService.kase.product) {
                $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
            }
        });

        $scope.$watchCollection(() => SearchCaseService.searchParameters.queryParams, (nv, ov) => {
            if (nv && nv !== ov && !isFilterInitialized) {
                isFilterInitialized = true;
                const productQuery = SearchCaseService.searchParameters.queryParams.find((v) => v.includes('case_product:'));
                const versionQuery = SearchCaseService.searchParameters.queryParams.find((v) => v.includes('case_version:'));

                if (productQuery) {
                    const product = productQuery.split(':')[1].replace(/['"]+/g, '');
                    CaseService.kase.product = product;
                }

                if (versionQuery) {
                    const version = versionQuery.split(':')[1].replace(/['"]+/g, '');
                    ProductsService.getVersions(CaseService.kase.product).then(() => CaseService.kase.version = version);
                }
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
