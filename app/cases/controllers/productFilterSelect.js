'use strict';

import remove from "lodash/remove";

export default class ProductSelect {
    constructor($rootScope, $scope, $location, securityService, SearchCaseService, CaseService, ProductsService, RHAUtils, CASE_EVENTS) {
        'ngInject';

        let initializedProduct = false;

        $scope.securityService = securityService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.CaseService = CaseService;
        $scope.ProductsService = ProductsService;
        $scope.products = [];
        $scope.product = 'all';

        function init() {
            if (RHAUtils.isEmpty(ProductsService.products)) {
                ProductsService.getProducts(false);
            }
        }
        init();

        $scope.$watch(function () {
            return ProductsService.products;
        }, function () {
            if (RHAUtils.isNotEmpty(ProductsService.products)) {
                $scope.products = ProductsService.products;
                $scope.products.unshift({ code: 'all', name: 'All Products'});
            }
        });
        //
        $scope.$watch('SearchCaseService.searchParameters', () => {
            const searchParams = SearchCaseService.searchParameters;

            if (searchParams && searchParams.queryParams) {
                const product = searchParams.queryParams.find((v) => v.includes('case_product:'));
                const version = searchParams.queryParams.find((v) => v.includes('case_version:'));

                if (product && !initializedProduct) {
                    $scope.product = product.split(':')[1].replace(/['"]+/g, '');
                    ProductsService.getVersions($scope.product, true);
                }

                if (!version && !initializedProduct) {
                    SearchCaseService.doFilter();
                }
            }
        });

        $scope.onProductChange = () => {
            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_version:') || v.includes('case_product:'));
            ProductsService.versions = [];

            if (!$scope.product) {
                $scope.product = 'all';
            }

            if ($scope.product !== 'all') {
                if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                    SearchCaseService.searchParameters.queryParams = [];
                }

                SearchCaseService.searchParameters.queryParams.push(`case_product:"${$scope.product}"`);
                ProductsService.getVersions($scope.product, true);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
    }
}
