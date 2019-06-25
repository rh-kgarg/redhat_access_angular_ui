'use strict';

export default class AccountSelect {
    constructor($scope, strataService, AlertService, CaseService, RHAUtils, gettextCatalog, ProductsService, securityService, $state, COMMON_CONFIG) {
        'ngInject';

        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.CaseService = CaseService;
        $scope.securityService = securityService;
        $scope.bookmarkAccountUrl = $state.href('accountBookmark');
        $scope.selectUserAccount = function () {
            CaseService.loadingAccountNumber = true;
            $scope.loadingAccountNumber = true;
            strataService.accounts.list().then(function (response) {
                CaseService.loadingAccountNumber = false;
                $scope.loadingAccountNumber = false;
                $scope.populateAccountSpecificFields(response);
            }, function (error) {
                CaseService.loadingAccountNumber = false;
                $scope.loadingAccountNumber = false;
                AlertService.addStrataErrorMessage(error);
            });
        };
        $scope.alertInstance = null;
        $scope.populateAccountSpecificFields = function (accountNumber) {
            CaseService.account.number = accountNumber;
            if (RHAUtils.isNotEmpty(CaseService.account.number)) {
                var promise = null;
                strataService.accounts.get(CaseService.account.number).then(function (account) {
                    CaseService.defineAccount(account);
                    if (RHAUtils.isNotEmpty($scope.alertInstance)) {
                        AlertService.removeAlert($scope.alertInstance);
                    }
                    promise = CaseService.populateUsers();
                    promise.then(angular.bind(this, function (users) {
                        if (RHAUtils.isEmpty(CaseService.owner)) {
                            ProductsService.clear();
                            CaseService.clearProdVersionFromLS();
                        }

                        CaseService.validateNewCase();
                    }));

                }, function () {
                    if (RHAUtils.isNotEmpty($scope.alertInstance)) {
                        AlertService.removeAlert($scope.alertInstance);
                    }
                    $scope.alertInstance = AlertService.addWarningMessage(gettextCatalog.getString('Account not found.'));
                    CaseService.users = [];
                    ProductsService.clear();
                    CaseService.clearProdVersionFromLS();
                    CaseService.validateNewCase();
                });
            } else {
                // field used for partner case management
                CaseService.virtualOwner = undefined;
                CaseService.managedAccountUsers = [];

                CaseService.populateUsers();
                CaseService.populateGroups(CaseService.owner);
                ProductsService.getProducts(false);
                // PCM-6541 if account.number is blank then show login user account.
                $scope.selectUserAccount();
            }
        };

        $scope.$watch('CaseService.account.name', function(){
            // PCM-6541 if account.number is blank then show login user account.
            if(CaseService.account && RHAUtils.isEmpty(CaseService.account.number)) {
                $scope.selectUserAccount();
            }
        });
    }
}
