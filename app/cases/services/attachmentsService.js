'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').service('AttachmentsService', [
    '$filter',
    '$q',
    '$sce',
    '$state',
    '$window',
    '$location',
    'RHAUtils',
    'strataService',
    'TreeViewSelectorUtils',
    '$http',
    'securityService',
    'AlertService',
    'CaseService',
    'gettextCatalog',
    function ($filter, $q, $sce, $state, $window, $location, RHAUtils, strataService, TreeViewSelectorUtils, $http, securityService, AlertService, CaseService, gettextCatalog) {
        this.originalAttachments = [];
        this.updatedAttachments = [];
        this.backendAttachments = [];
        this.suggestedArtifact = {};
        this.proceedWithoutAttachments = false;
        this.maxAttachmentSize;
        this.clear = function () {
            this.originalAttachments = [];
            this.updatedAttachments = [];
            this.backendAttachments = [];
            this.suggestedArtifact = {};
        };
        this.updateBackEndAttachments = function (selected) {
            this.backendAttachments = selected;
        };
        this.hasBackEndSelections = function () {
            return TreeViewSelectorUtils.hasSelections(this.backendAttachments);
        };
        this.removeUpdatedAttachment = function ($index) {
            this.updatedAttachments.splice($index, 1);
        };
        this.removeOriginalAttachment = function (attachment) {
            var progressMessage = AlertService.addWarningMessage(gettextCatalog.getString('Deleting attachment: {{attachmentName}}',{attachmentName:attachment.file_name}));
            strataService.cases.attachments.remove(attachment.uuid, CaseService.kase.case_number).then(angular.bind(this, function () {
                AlertService.removeAlert(progressMessage);
                AlertService.addSuccessMessage(gettextCatalog.getString('Successfully deleted attachment:{{attachmentName}}',{attachmentName:attachment.file_name}));
                var i = 0;
                for(i; i < this.originalAttachments.length; i++){
                    if(this.originalAttachments[i].uuid === attachment.uuid){
                        break;
                    }
                }
                this.originalAttachments.splice(i, 1);
            }), function (error) {
                AlertService.addStrataErrorMessage(error);
            });
        };
        this.addNewAttachment = function (attachment) {
            this.updatedAttachments.push(attachment);
        };
        this.defineOriginalAttachments = function (attachments) {
            if (!angular.isArray(attachments)) {
                this.originalAttachments = [];
            } else {
                this.originalAttachments = attachments;
            }
        };
        this.postBackEndAttachments = function (caseId) {
            var selectedFiles = TreeViewSelectorUtils.getSelectedLeaves(this.backendAttachments);
            return securityService.getBasicAuthToken().then(function (auth) {
                /*jshint unused:false */
                //we post each attachment separately
                var promises = [];
                angular.forEach(selectedFiles, function (file) {
                    var jsonData = {
                            authToken: auth,
                            attachment: file,
                            caseNum: caseId
                        };
                    var deferred = $q.defer();
                    $http.post('attachments', jsonData).success(function (data, status, headers, config) {
                        deferred.resolve(data);
                        AlertService.clearAlerts();
                        AlertService.addSuccessMessage(gettextCatalog.getString('Successfully uploaded attachment {{attachmentName}} to case {{caseNumber}}',{attachmentName:jsonData.attachment,caseNumber:caseId}));
                    }).error(function (data, status, headers, config) {
                        var errorMsg = '';
                        switch (status) {
                        case 401:
                            errorMsg = ' : Unauthorised.';
                            break;
                        case 409:
                            errorMsg = ' : Invalid username/password.';
                            break;
                        case 500:
                            errorMsg = ' : Internal server error';
                            break;
                        }
                        AlertService.addDangerMessage(gettextCatalog.getString('Failed to upload attachment {{attachmentName}} to case {{caseNumber}}: {{errorMessage}}',{attachmentName:jsonData.attachment,caseNumber:caseId,errorMessage:errorMsg}));
                        deferred.reject(data);
                    });
                    promises.push(deferred.promise);
                });
                return $q.all(promises);
            });
        };
        this.updateAttachments = function (caseId) {
            var hasServerAttachments = this.hasBackEndSelections();
            var hasLocalAttachments = !angular.equals(this.updatedAttachments.length, 0);
            if (hasLocalAttachments || hasServerAttachments) {
                var promises = [];
                var updatedAttachments = this.updatedAttachments;
                if (hasServerAttachments) {
                    promises.push(this.postBackEndAttachments(caseId));
                }
                if (hasLocalAttachments) {
                    //find new attachments
                    angular.forEach(updatedAttachments, function (attachment) {
                        if (!attachment.hasOwnProperty('uuid')) {
                            var formdata = new FormData();
                            formdata.append('file', attachment.fileObj);
                            formdata.append('description', attachment.description);

                            var promise = strataService.cases.attachments.post(formdata, caseId);
                            promise.then(function (uri) {
                                attachment.uri = uri;
                                attachment.uuid = uri.slice(uri.lastIndexOf('/') + 1);
                                var currentDate =new Date();
                                var lastModifiedDate = RHAUtils.convertToTimezone(currentDate);
                                attachment.sortModifiedDate=currentDate;
                                attachment.last_modified_date = RHAUtils.formatDate(lastModifiedDate, 'MMM DD YYYY');
                                attachment.last_modified_time = RHAUtils.formatDate(lastModifiedDate, 'hh:mm A Z');
                                attachment.published_date = RHAUtils.formatDate(lastModifiedDate, 'MMM DD YYYY');
                                attachment.published_time = RHAUtils.formatDate(lastModifiedDate, 'hh:mm A Z');
                                AlertService.clearAlerts();
                                AlertService.addSuccessMessage(gettextCatalog.getString('Successfully uploaded attachment {{attachmentFileName}} to case {{caseNumber}}',{attachmentFileName:attachment.file_name,caseNumber:caseId}));
                            }, function (error) {
                                if (navigator.appVersion.indexOf("MSIE 10") !== -1){
                                    if($location.path() === '/case/new'){
                                        $state.go('edit', { id: caseId });
                                        AlertService.clearAlerts();
                                        CaseService.submittingCase = false;
                                    } else{
                                        $window.location.reload();
                                    }
                                } else{
                                    AlertService.addStrataErrorMessage(error);
                                }
                            });
                            promises.push(promise);
                        }
                    });
                }
                var uploadingAlert = AlertService.addWarningMessage(gettextCatalog.getString('Uploading attachments...'));
                var parentPromise = $q.all(promises);
                parentPromise.then(angular.bind(this, function () {
                    this.originalAttachments = this.originalAttachments.concat(this.updatedAttachments);
                    this.updatedAttachments = [];
                    AlertService.removeAlert(uploadingAlert);
                }), function (error) {
                    AlertService.addStrataErrorMessage(error);
                    AlertService.removeAlert(uploadingAlert);
                });
                return parentPromise;
            }
        };
        this.parseArtifactHtml = function () {
            var parsedHtml = '';
            if (RHAUtils.isNotEmpty(this.suggestedArtifact.description)) {
                var rawHtml = this.suggestedArtifact.description.toString();
                parsedHtml = $sce.trustAsHtml(rawHtml);
            }
            return parsedHtml;
        };
        this.fetchMaxAttachmentSize = function () {
            strataService.values.cases.attachment.size().then(angular.bind(this, function (response) {
                if (RHAUtils.isNotEmpty(response)) {
                    this.maxAttachmentSize = response.match(/\d+/)[0];
                }
            }), function (error) {
                AlertService.addStrataErrorMessage(error);
            });
        };
    }
]);
