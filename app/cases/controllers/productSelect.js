'use strict';
import _        from 'lodash';

export default class ProductSelect {
    constructor($scope, securityService, SearchCaseService, CaseService, ProductsService, strataService, AlertService, RHAUtils, RecommendationsService) {
        'ngInject';

        $scope.securityService = securityService;
        $scope.SearchCaseService = SearchCaseService;
        $scope.CaseService = CaseService;
        $scope.ProductsService = ProductsService;
        $scope.RecommendationsService = RecommendationsService;
        $scope.products = [];
        $scope.product = CaseService.kase.product || 'all';

        $scope.$watch(function () {
            return ProductsService.products;
        }, function () {
            if (RHAUtils.isNotEmpty(ProductsService.products)) {
                $scope.products = ProductsService.products;

                if ($scope.isFilter) {
                    $scope.products.unshift({ code: 'all', name: 'All Products'});
                    $scope.product = 'all';
                }

                if (RHAUtils.isNotEmpty(CaseService.kase.product)) {
                    let selectedProduct = {
                        code: CaseService.kase.product,
                        name: CaseService.kase.product
                    };
                    let prodInArray = false;
                    for (var i = 0; i < $scope.products.length; i++) {
                        if ($scope.products[i].code === selectedProduct.code && $scope.products[i].name === selectedProduct.name) {
                            prodInArray = true;
                        }
                    }
                    if (!prodInArray) {
                        $scope.products.push(selectedProduct);
                    }
                }
            }
        });

        $scope.onProductSelect = function ($event) {
            if ($scope.product !== 'all') {
                CaseService.kase.product = $scope.product;
                // Check Products and update entitlements
                const selectedProduct = _.find(ProductsService.products,{ 'name': CaseService.kase.product});
                CaseService.updateAndValidateEntitlements(selectedProduct);
                if(CaseService.kase.product !== CaseService.prestineKase.product) {
                    CaseService.kase.version="";
                }
                CaseService.validateNewCase();
                ProductsService.getVersions(CaseService.kase.product, true);
                CaseService.updateLocalStorageForNewCase();

                if (!$scope.isFilter) {
                    CaseService.sendCreationStartedEvent($event);
                }
            } else {
                delete CaseService.kase.product;
                delete CaseService.kase.version;
                ProductsService.versions = [];
            }
        };
    }
}
