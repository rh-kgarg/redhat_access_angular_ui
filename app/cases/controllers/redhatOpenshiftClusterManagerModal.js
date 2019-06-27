'use strict';

export default class RedhatOpenshiftClusterManagerModal {
    constructor($scope, $uibModalInstance) {
        'ngInject';

        $scope.confirm = () => $uibModalInstance.close(true);
        $scope.closeModal = () => $uibModalInstance.close();
    }
}
