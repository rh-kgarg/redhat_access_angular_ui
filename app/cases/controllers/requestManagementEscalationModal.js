'use strict';

import hydrajs  from '../../shared/hydrajs';

export default class RequestManagementEscalationModal {
    constructor($scope, $uibModalInstance, AlertService, CaseService, DiscussionService, strataService, securityService, $q, $stateParams, RHAUtils, gettextCatalog) {
        'ngInject';

        $scope.CaseService = CaseService;
        $scope.submittingRequest = false;
        $scope.RMEGeoList = [
            {label:'North America', value: 'NA'},
            {label:'Europe, the Middle East and Africa', value: 'EMEA'},
            {label:'Latin America', value: 'LATAM'},
            {label:'Asia Pacific', value: 'APAC'},{label:'Combo', value: 'Combo'}
        ];
        $scope.securityService = securityService;
        if (RHAUtils.isNotEmpty(CaseService.commentText)) {
            $scope.disableSubmitRequest = false;
            CaseService.escalationCommentText = CaseService.commentText;
        } else {
            $scope.disableSubmitRequest = true;
        }
        $scope.submitRequestClick = angular.bind($scope, function (commentText) {
            $scope.submittingRequest = true;
            var fullComment = 'Request Management Escalation: ' + commentText;
            var onSuccess = function (response) {
                CaseService.checkForCaseStatusToggleOnAttachOrComment();

                CaseService.populateComments($stateParams.id).then(function (comments) {
                    $scope.closeModal();
                    if (CaseService.localStorageCache) {
                        CaseService.localStorageCache.remove(CaseService.kase.case_number + securityService.loginStatus.authedUser.sso_username);
                    }
                    $scope.submittingRequest = false;
                    CaseService.draftSaved = false;
                    CaseService.draftComment = undefined;
                    CaseService.commentText = undefined;
                    DiscussionService.commentTextBoxEnlargen = false;
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                });
            };
            var onError = function (error) {
                AlertService.addStrataErrorMessage(error);
            };

            if (CaseService.localStorageCache) {
                if (CaseService.draftCommentOnServerExists) {
                    strataService.cases.comments.put(CaseService.kase.case_number, fullComment, false, true, CaseService.draftComment.id).then(onSuccess, onError);
                }
                else {
                    strataService.cases.comments.post(CaseService.kase.case_number, fullComment, true, false).then(onSuccess, onError);
                }
            }
            else {
                if (RHAUtils.isNotEmpty(CaseService.draftComment)) {
                    strataService.cases.comments.put(CaseService.kase.case_number, fullComment, false, true, CaseService.draftComment.id).then(onSuccess, onError);
                } else {
                    strataService.cases.comments.post(CaseService.kase.case_number, fullComment, true, false).then(onSuccess, onError);
                }
            }


        });
        $scope.closeModal = function () {
            CaseService.escalationCommentText = undefined;
            CaseService.escalationSubject = undefined;
            CaseService.escalationDescription = undefined;
            CaseService.escalationExpectations = undefined;
            CaseService.rmeEscalationGeo = undefined;
            $uibModalInstance.close();
        };
        $scope.showErrorMessage = function (errorMessage) {
            AlertService.clearAlerts();
            $scope.closeModal();
            $scope.submittingRequest = false;
            AlertService.addStrataErrorMessage(errorMessage);
        };
        $scope.onNewEscalationComment = function () {
            if (RHAUtils.isNotEmpty(CaseService.escalationSubject) && !$scope.submittingRequest && RHAUtils.isNotEmpty(CaseService.escalationDescription)
               && RHAUtils.isNotEmpty(CaseService.escalationExpectations) && RHAUtils.isNotEmpty(CaseService.rmeEscalationGeo)) {
                $scope.disableSubmitRequest = false;
            } else if (RHAUtils.isEmpty(CaseService.escalationCommentText)) {
                $scope.disableSubmitRequest = true;
            }
        };

        $scope.submitRMEEscalation = function () {
            $scope.submittingRequest = true;
            // get contact information from the hydra
            hydrajs.accounts.getContactDetailBySso(securityService.loginStatus.authedUser.sso_username).then((contactInfo) => {
                const severity = CaseService.kase.severity && CaseService.kase.severity.name && CaseService.kase.severity.name.substring(0, 1);
                let escalationJSON = {
                    'record_type': 'Active Customer Escalation',
                    'subject': CaseService.escalationSubject,
                    'issue_description': CaseService.escalationDescription,
                    'escalation_source': 'RME Escalation',
                    'expectations': CaseService.escalationExpectations,
                    'status': 'New',
                    'account_number': CaseService.kase.account_number,
                    'case_number': CaseService.kase.case_number,
                    'requestor': contactInfo.name,
                    'requestor_email': contactInfo.email,
                    'requestor_phone': contactInfo.phone,
                    'already_escalated': false,
                    'geo': CaseService.rmeEscalationGeo.value,
                    'severity': RHAUtils.isNotEmpty(severity) ? severity : '3',
                };
                const promise = strataService.escalationRequest.create(escalationJSON);
                promise.then((escalationNum) => {
                    $scope.submitEscalationComment(escalationNum);
                }, (error) => {
                    $scope.showErrorMessage(error);
                });
            }, (error) => {
                $scope.showErrorMessage(error);
            });
        };
        $scope.submitEscalationComment = function (escalationNum) {
            var fullComment = `Request Management Escalation:\n Subject: ${CaseService.escalationSubject}\n Description: ${CaseService.escalationDescription}\n Expectations: ${CaseService.escalationExpectations}`;
            if (escalationNum) {      
                CaseService.getCaseEscalation(CaseService.kase.account_number, CaseService.kase.case_number);
            }
            strataService.cases.comments.post(CaseService.kase.case_number, fullComment, true, false).then(function(){
                CaseService.checkForCaseStatusToggleOnAttachOrComment();
                if (escalationNum !== undefined) {
                    AlertService.addSuccessMessage(gettextCatalog.getString('Your Escalation request has been sent successfully'));
                }
                CaseService.populateComments($stateParams.id).then(function (comments) {
                    AlertService.clearAlerts();
                    $scope.closeModal();
                    $scope.submittingRequest = false;
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                });
            }, function (error) {
                $scope.showErrorMessage(error);
            });
        }
    }
}
