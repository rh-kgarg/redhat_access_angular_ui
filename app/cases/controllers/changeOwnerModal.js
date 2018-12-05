'use strict';

export default class ChangeOwnerModal {
    constructor($scope, $uibModalInstance, CaseService, strataService, AlertService, gettextCatalog, RHAUtils) {
        'ngInject';

        $scope.CaseService = CaseService;
        $scope.caseOwner = {};
        $scope.RHAUtils = RHAUtils;
        $scope.updatingOwner = false;
        $scope.confirm = () => {
            if (RHAUtils.isNotEmpty($scope.caseOwner.sso_username)) {
                $scope.updatingOwner = true;
                let promise = strataService.cases.owner.update(CaseService.kase.case_number,$scope.caseOwner.sso_username);
                promise.then((response) => {
                    AlertService.addSuccessMessage(gettextCatalog.getString('Case  {{caseNumber}} owner successfully changed.', {caseNumber: CaseService.kase.case_number}));
                    CaseService.kase.owner = $scope.caseOwner.first_name+' '+$scope.caseOwner.last_name;
                    angular.copy(CaseService.kase, CaseService.prestineKase);
                    CaseService.fetchHydraCaseDetails();
                    $scope.updatingOwner = false;
                    $uibModalInstance.close();
                }, (error) => {
                    $scope.updatingOwner = false;
                    AlertService.addStrataErrorMessage(error);
                    $uibModalInstance.close();
                });
            }
        };
        $scope.closeModal = () => {
            $uibModalInstance.close();
        };
    }
}
