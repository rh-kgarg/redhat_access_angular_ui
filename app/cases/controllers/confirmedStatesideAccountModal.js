'use strict';

export default class ConfirmedStatesideAccountModal {
    constructor($scope, $uibModalInstance) {
        'ngInject';
        $scope.closeModal = () => $uibModalInstance.close();
    }
}
