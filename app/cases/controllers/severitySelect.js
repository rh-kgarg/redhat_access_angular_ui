'use strict';

export default class SeveritySelect {
    constructor($scope, CaseService, RHAUtils) {
        'ngInject';

        // INIT
        const defaultSeverityName = '4 (Low)';
        $scope.ie8 = window.ie8;
        $scope.openedDetails = {};
        $scope.CaseService = CaseService;
        $scope.openedDetails[defaultSeverityName] = true;

        $scope.toggleDetails = function (severity, event) {
            if (event.stopPropagation) { // we don't want to toggle severity
                event.stopPropagation();
            } else { // for IE8+
                event.returnValue = false;
                event.cancelBubble = true;
            }
            $scope.openSeverityDetails(severity.name);
            CaseService.validateNewCase();
        };

        $scope.openSeverityDetails = function (severityName) {
            if (RHAUtils.isNotEmpty(severityName)) {
                angular.forEach($scope.severities, function (severity) {
                    $scope.openedDetails[severity.name] = (severity.name === severityName);
                });
            }
        };

        $scope.$watch("createdCase.severity", function () {
            $scope.severityChange();
        });

        $scope.$watch('createdCase.product', function () {
            if (!CaseService.isValidSeverity($scope.createdCase.severity)) {
                Object.keys($scope.openedDetails).forEach((key) => $scope.openedDetails[key] = key === defaultSeverityName);
                $scope.severities.forEach((severity) => {
                    if (severity.name === defaultSeverityName) {
                        $scope.severity = severity;
                        $scope.createdCase.severity = severity;
                    }
                });

                $scope.severityChange();
            }
        });
    }
}
