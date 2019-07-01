'use strict';

import remove from "lodash/remove";

export default class ProductSelect {
    constructor($rootScope, $scope, $location, securityService, SearchCaseService, CaseService, ProductsService, RHAUtils, CASE_EVENTS) {
        'ngInject';

        const defaultVersion = 'All Versions';
        let initializedVersion = false;

        $scope.SearchCaseService = SearchCaseService;
        $scope.ProductsService = ProductsService;
        $scope.versions = [];
        $scope.version = defaultVersion;

        $scope.$watch(function () {
            return ProductsService.versions;
        }, function () {
            if (RHAUtils.isNotEmpty(ProductsService.versions)) {
                $scope.versions = ProductsService.versions;
                $scope.versions.unshift(defaultVersion);
            } else {
                $scope.versions = [];
            }
        });

        $scope.hasProductQuery = () => SearchCaseService.searchParameters && SearchCaseService.searchParameters.queryParams && SearchCaseService.searchParameters.queryParams.find((v) => v.includes('case_product:'));

        $scope.$watch('SearchCaseService.searchParameters', () => {
            const searchParams = SearchCaseService.searchParameters;

            if (searchParams && searchParams.queryParams) {
                const version = searchParams.queryParams.find((v) => v.includes('case_version:'));

                if (version && !initializedVersion) {
                    initializedVersion = true;
                    $scope.version = version.split(':')[1].replace(/['"]+/g, '');
                    SearchCaseService.doFilter();
                }
            }
        });

        $scope.onVersionChange = () => {
            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:'));

            if (!$scope.version) {
                $scope.version = defaultVersion;
            }

            if ($scope.version !== defaultVersion) {
                SearchCaseService.searchParameters.queryParams.push(`case_version:"${$scope.version}"`);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
    }
}
