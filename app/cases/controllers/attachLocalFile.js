'use strict';
/*global $ */
angular.module('RedhatAccess.cases').controller('AttachLocalFile', [
    '$scope',
    'AlertService',
    'AttachmentsService',
    'CaseService',
    'securityService',
    'RHAUtils',
    'gettextCatalog',
    function ($scope, AlertService, AttachmentsService, CaseService, securityService, RHAUtils,gettextCatalog) {
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.NO_FILE_CHOSEN = 'No file chosen';
        $scope.fileDescription = '';

        $scope.init = function () {
            AttachmentsService.fetchMaxAttachmentSize();
        };

        $scope.clearSelectedFile = function () {
            $scope.fileName = $scope.NO_FILE_CHOSEN;
            $scope.fileDescription = '';
        };
        $scope.addFile = function () {
            /*jshint camelcase: false */
            var createdDate = RHAUtils.convertToTimezone(new Date());
            AttachmentsService.addNewAttachment({
                file_name: $scope.fileName,
                description: $scope.fileDescription,
                fileObj: $scope.fileObj,
                length: $scope.fileSize,
                created_by: securityService.loginStatus.authedUser.last_name+', '+securityService.loginStatus.authedUser.first_name,
                last_modified_by: securityService.loginStatus.authedUser.last_name+', '+securityService.loginStatus.authedUser.first_name,
                created_date:  RHAUtils.formatDate(createdDate, 'MMM DD YYYY'),
                created_time:  RHAUtils.formatDate(createdDate, 'hh:mm A Z')
            });
            $scope.clearSelectedFile();
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }
        };
        $scope.getFile = function () {
            $('#fileUploader').click();
        };
        $scope.selectFile = function () {
            // Strata will always keep the limit display in Mb (current = 1024Mb)
            var maxSize = (AttachmentsService.maxAttachmentSize/1024)*1000000000;
            if($('#fileUploader')[0].files[0].size < maxSize){
                $scope.fileObj = $('#fileUploader')[0].files[0];
                $scope.fileSize = $scope.fileObj.size;
                $scope.fileName = $scope.fileObj.name;
                if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                    $scope.$apply();
                }
	            $scope.addFile();
            } else {
                 var message=gettextCatalog.getString("{{errorFileName}} cannot be attached because it is larger than {{errorFileSize}} GB. Please FTP large files to dropbox.redhat.com.",{errorFileName:$('#fileUploader')[0].files[0].name,errorFileSize:(AttachmentsService.maxAttachmentSize/1024)});
                AlertService.addDangerMessage(message);
            }
            $('#fileUploader')[0].value = '';
        };
        $scope.clearSelectedFile();
        $scope.init();
    }
]);
