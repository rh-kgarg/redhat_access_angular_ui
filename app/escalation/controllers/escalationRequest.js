'use strict';
angular.module('RedhatAccess.escalation').controller('EscalationRequest', [
    '$scope',
    'EscalationRequestService',
    '$location',
    'RHAUtils',
    'ESCALATION_TYPE',
    'AUTH_EVENTS',
    'AlertService',
    'securityService',
    'HeaderService',
    'gettextCatalog',
    function ($scope, EscalationRequestService, $location, RHAUtils, ESCALATION_TYPE, AUTH_EVENTS, AlertService , securityService , HeaderService, gettextCatalog) {
        $scope.EscalationRequestService = EscalationRequestService;
        $scope.HeaderService = HeaderService;
        $scope.securityService = securityService;
        $scope.disableSendRequest = true;
        $scope.isSubjectTextAreaHidden = true;
        $scope.ESCALATION_TYPE = ESCALATION_TYPE;
        $scope.partnerGeoList = ['NA','EMEA','LATAM','APAC'];
        $scope.iceGeoList = ['NA','EMEA','LATAM','APAC','Combo'];
        $scope.subjectList = ['Product Issue',
        'Integration Issue',
        'Critical Customer Issue',
        'Too Long to Resolve',
        'Solution not Satisfactory',
        'Support Staff not Helpful',
        'Response Time Slow',
        'Closed not Resolved',
        'Customer needs to Speak to a Human',
        'Other'];

        $scope.checkForToggleSubjectTextArea = function(){
            if(EscalationRequestService.subject === 'Other'){
                $scope.isSubjectTextAreaHidden = false;
            }
        }
        $scope.submitEscalationRequest = function(escalationType) {
            var recordType = '';
            var emailCheck = true;
            if (escalationType === ESCALATION_TYPE.partner) {
                recordType = ESCALATION_TYPE.partner;
            } else if (escalationType === ESCALATION_TYPE.ice) {
                recordType = ESCALATION_TYPE.ice;
                emailCheck = $scope.validateEmailField();
            } else if (escalationType === ESCALATION_TYPE.sales) {
                recordType = ESCALATION_TYPE.sales;
            }
            if (emailCheck) {
                $scope.disableSendRequest = true;
                EscalationRequestService.sendEscalationRequest(recordType);
            }
        };
        $scope.partnerMandatoryFieldCheck = function() {
            if (RHAUtils.isNotEmpty(EscalationRequestService.accountNumber) && RHAUtils.isNotEmpty(EscalationRequestService.caseNumber)
                && RHAUtils.isNotEmpty(EscalationRequestService.geo) && RHAUtils.isNotEmpty(EscalationRequestService.issueDescription) && RHAUtils.isNotEmpty(EscalationRequestService.subject)) {
                $scope.disableSendRequest = false;
            } else {
                $scope.disableSendRequest = true;
            }
        };
        $scope.iceMandatoryFieldCheck = function() {
            if (RHAUtils.isNotEmpty(EscalationRequestService.accountNumber) && RHAUtils.isNotEmpty(EscalationRequestService.caseNumber)
                && RHAUtils.isNotEmpty(EscalationRequestService.geo) && RHAUtils.isNotEmpty(EscalationRequestService.issueDescription)
                && RHAUtils.isNotEmpty(EscalationRequestService.requestorEmail) && RHAUtils.isNotEmpty(EscalationRequestService.requestorPhone)
                && RHAUtils.isNotEmpty(EscalationRequestService.customerName) && RHAUtils.isNotEmpty(EscalationRequestService.customerEmail)
                && RHAUtils.isNotEmpty(EscalationRequestService.customerPhone) && RHAUtils.isNotEmpty(EscalationRequestService.expectations)) {
                $scope.disableSendRequest = false;
            } else {
                $scope.disableSendRequest = true;
            }
        };
        $scope.validateEmailField = function() {
            if (RHAUtils.isEmailValid(EscalationRequestService.requestorEmail) && RHAUtils.isEmailValid(EscalationRequestService.customerEmail)) {
                if (EscalationRequestService.requestorEmail.search('redhat.com') > 0) {
                    return true;
                } else {
                    AlertService.addWarningMessage(gettextCatalog.getString('Please check the requestor email address'));
                }
            } else {
                AlertService.addWarningMessage(gettextCatalog.getString('Email address is incorrect'));
            }
            return false;
        };
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            AlertService.clearAlerts();
        });
    }
]);
