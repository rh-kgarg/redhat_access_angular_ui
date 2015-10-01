'use strict';
/*global $, draftComment*/
/*jshint camelcase: false, expr: true*/
angular.module('RedhatAccess.cases').controller('AddCommentSection', [
    '$scope',
    'strataService',
    'CaseService',
    'AlertService',
    'AttachmentsService',
    'DiscussionService',
    'securityService',
    '$timeout',
    'RHAUtils',
    'EDIT_CASE_CONFIG',
    'gettextCatalog',
    function ($scope, strataService, CaseService, AlertService, AttachmentsService, DiscussionService, securityService, $timeout, RHAUtils, EDIT_CASE_CONFIG, gettextCatalog) {
        $scope.CaseService = CaseService;
        $scope.securityService = securityService;
        $scope.AttachmentsService = AttachmentsService;
        $scope.DiscussionService = DiscussionService;
        $scope.addingComment = false;
        $scope.progressCount = 0;
        $scope.charactersLeft = 0;
        $scope.maxCommentLength = '32000';
        $scope.ieFileDescription = '';

        DiscussionService.commentTextBoxEnlargen = false;

        $scope.clearComment = function(){
        	CaseService.commentText = '';
            DiscussionService.commentTextBoxEnlargen = false;
        	CaseService.localStorageCache.remove(CaseService.kase.case_number+securityService.loginStatus.authedUser.sso_username);
        	AttachmentsService.updatedAttachments = [];
        };

        $scope.addComment = function () {
            if (!securityService.loginStatus.authedUser.is_internal) {
                CaseService.isCommentPublic = true;
            }
            var onSuccess = function () {
                CaseService.isCommentPublic = true;
                CaseService.draftCommentOnServerExists=false;
                if(CaseService.localStorageCache)
                {
                    CaseService.localStorageCache.remove(CaseService.kase.case_number+securityService.loginStatus.authedUser.sso_username);
                }
                if (RHAUtils.isNotEmpty($scope.saveDraftPromise)) {
                    $timeout.cancel($scope.saveDraftPromise);
                }
                CaseService.commentText = '';
                CaseService.disableAddComment = true;
                CaseService.checkForCaseStatusToggleOnAttachOrComment();

                CaseService.populateComments(CaseService.kase.case_number).then(function () {
                    $scope.addingComment = false;
                    $scope.savingDraft = false;
                    CaseService.draftSaved = false;
                    CaseService.draftComment = undefined;
                    DiscussionService.commentTextBoxEnlargen = false;
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                });
                $scope.progressCount = 0;
                $scope.charactersLeft = 0;

                if(securityService.loginStatus.authedUser.sso_username !== undefined && CaseService.updatedNotifiedUsers.indexOf(securityService.loginStatus.authedUser.sso_username) === -1){
                    strataService.cases.notified_users.add(CaseService.kase.case_number, securityService.loginStatus.authedUser.sso_username).then(function () {
                        CaseService.updatedNotifiedUsers.push(securityService.loginStatus.authedUser.sso_username);
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }

            };
            var onError = function (error) {
                AlertService.addStrataErrorMessage(error);
                $scope.addingComment = false;
                $scope.progressCount = 0;
                $scope.charactersLeft = 0;
            };
            if(!CaseService.disableAddComment && CaseService.commentText !== 'undefined'){
                $scope.addingComment = true;
                if(CaseService.localStorageCache) {
                    if(CaseService.draftCommentOnServerExists)
                    {
                        strataService.cases.comments.put(CaseService.kase.case_number, CaseService.commentText, false, CaseService.isCommentPublic, CaseService.draftComment.id).then(onSuccess, onError);
                    }
                    else {
                        strataService.cases.comments.post(CaseService.kase.case_number, CaseService.commentText, CaseService.isCommentPublic, false).then(onSuccess, onError);
                    }
                }
                else {
                    if (RHAUtils.isNotEmpty(CaseService.draftComment)) {
                        strataService.cases.comments.put(CaseService.kase.case_number, CaseService.commentText, false, CaseService.isCommentPublic, CaseService.draftComment.id).then(onSuccess, onError);
                    } else {
                        strataService.cases.comments.post(CaseService.kase.case_number, CaseService.commentText, CaseService.isCommentPublic, false).then(onSuccess, onError);
                    }
                }
            }
            if ((AttachmentsService.updatedAttachments.length > 0 || AttachmentsService.hasBackEndSelections()) && EDIT_CASE_CONFIG.showAttachments) {
                $scope.addingattachment = true;
                AttachmentsService.updateAttachments(CaseService.kase.case_number).then(function () {
                    $scope.addingattachment = false;
                    CaseService.checkForCaseStatusToggleOnAttachOrComment();
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                    $scope.addingattachment = false;
                });
            }
        };
        $scope.saveDraftPromise;
        $scope.onNewCommentKeypress = function () {
            if(CaseService.localStorageCache)
            {
                if(CaseService.draftCommentOnServerExists)
                {
                    CaseService.draftCommentLocalStorage = {'text': CaseService.commentText,
                        'id': CaseService.draftComment.id,
                        'draft': true,
                        'public': CaseService.isCommentPublic,
                        'case_number': CaseService.kase.case_number
                    };
                }
                else {
                    CaseService.draftCommentLocalStorage = {
                        'text': CaseService.commentText,
                        'draft': true,
                        'public': CaseService.isCommentPublic,
                        'case_number': CaseService.kase.case_number
                    };
                }
                if(RHAUtils.isEmpty(CaseService.commentText))
                {
                    CaseService.draftCommentLocalStorage.public=true;
                }
                CaseService.localStorageCache.put(CaseService.kase.case_number+securityService.loginStatus.authedUser.sso_username,CaseService.draftCommentLocalStorage);
                CaseService.disableAddComment = false;
                if (RHAUtils.isEmpty(CaseService.commentText)) {
                    CaseService.disableAddComment = true;
                }
            }
            else {
                if (RHAUtils.isNotEmpty(CaseService.commentText) && !$scope.addingComment) {
                    CaseService.disableAddComment = false;
                    $timeout.cancel($scope.saveDraftPromise);
                    $scope.saveDraftPromise = $timeout(function () {
                        if (!$scope.addingComment && CaseService.commentText !== '') {
                            $scope.saveDraft();
                        }
                    }, 5000);
                } else if (RHAUtils.isEmpty(CaseService.commentText)) {
                    CaseService.disableAddComment = true;
                }
            }
        };

        $scope.onCommentPublicChange = function () {
            if(RHAUtils.isNotEmpty(CaseService.commentText))
            {
                $scope.onNewCommentKeypress();
            }

        };
        $scope.$watch('CaseService.commentText', function() {
            $scope.maxCharacterCheck();
        });
        $scope.maxCharacterCheck = function() {
            if (CaseService.commentText !== undefined && $scope.maxCommentLength  >= CaseService.commentText.length) {
                var count = CaseService.commentText.length * 100 / $scope.maxCommentLength ;
                parseInt(count);
                $scope.progressCount = Math.round(count * 100) / 100;
                var breakMatches = CaseService.commentText.match(/(\r\n|\n|\r)/g);
                var numberOfLineBreaks = 0;
                if(breakMatches){
                    numberOfLineBreaks = breakMatches.length;
                }
                $scope.charactersLeft = $scope.maxCommentLength - CaseService.commentText.length - numberOfLineBreaks;
                if($scope.charactersLeft < 0){
                    $scope.charactersLeft = 0;
                }
            }
            else if(CaseService.commentText===undefined)
            {
                $scope.progressCount=0;
                $scope.charactersLeft = 0;
            }
        };
        $scope.saveDraft = function () {
            $scope.savingDraft = true;
            if (!securityService.loginStatus.authedUser.is_internal) {
                CaseService.isCommentPublic = true;
            }
            var onSuccess = function (commentId) {
                $scope.savingDraft = false;
                CaseService.draftSaved = true;
                CaseService.draftComment = {
                    'text': CaseService.commentText,
                    'id': RHAUtils.isNotEmpty(commentId) ? commentId : CaseService.draftComment.id,
                    'draft': true,
                    'public': CaseService.isCommentPublic,
                    'case_number': CaseService.kase.case_number
                };
            };
            var onFailure = function (error) {
                AlertService.addStrataErrorMessage(error);
                $scope.savingDraft = false;
            };
            if (RHAUtils.isNotEmpty(CaseService.draftComment)) {
                //draft update
                strataService.cases.comments.put(CaseService.kase.case_number, CaseService.commentText, true, CaseService.isCommentPublic, CaseService.draftComment.id).then(onSuccess, onFailure);
            } else {
                //initial draft save
                strataService.cases.comments.post(CaseService.kase.case_number, CaseService.commentText, CaseService.isCommentPublic, true).then(onSuccess, onFailure);
            }
        };
        $scope.shouldTextboxMinimize = function(){
            if(RHAUtils.isEmpty(CaseService.commentText)){
                DiscussionService.commentTextBoxEnlargen=false;
            }
        };
        $scope.ieFileUpload = function($event) {
            var form = document.getElementById('fileUploaderForm');
            var iframeId = document.getElementById('upload_target');
            form.action = 'https://' + window.location.host + '/rs/cases/' + CaseService.kase.case_number + '/attachments';

            var eventHandler = function () {
                if (iframeId.removeEventListener){
                    iframeId.removeEventListener('load', eventHandler, false);
                }else if (iframeId.detachEvent){
                    iframeId.detachEvent('onload', eventHandler);
                }
                if(!$scope.ie8){
                    var content;
                    if (iframeId.contentDocument && iframeId.contentDocument.body !== null) {
                        content = iframeId.contentDocument.body.innerText;
                    } else if (iframeId.contentWindow && iframeId.contentWindow.document.body !== null) {
                        content = iframeId.contentWindow.document.body.innerText;
                    }
                    if (content !== undefined && content.length) {
                        var parser = document.createElement('a');
                        parser.href = content;
                        var splitPath = parser.pathname.split('/');
                        if(splitPath !== undefined && splitPath[4] !== undefined){
                            AttachmentsService.clear();
                            strataService.cache.clr('attachments' + CaseService.kase.case_number);
                            strataService.cases.attachments.list(CaseService.kase.case_number).then(function (attachmentsJSON) {
                                $scope.addingComment = false;
                                AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                                $scope.ieClearSelectedFile();

                            }, function (error) {
                                $scope.addingComment = false;
                                AlertService.addStrataErrorMessage(error);
                            });
                        } else {
                            $scope.addingComment = false;
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}',{errorMessage:content}));
                            $scope.$apply();
                        }
                    } else {
                        $scope.addingComment = false;
                        AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}',{errorMessage:content}));
                        $scope.$apply();
                    }
                }else {
                    strataService.cases.attachments.list(CaseService.kase.case_number).then(function (attachmentsJSON) {
                        $scope.addingComment = false;
                        if(attachmentsJSON.length !== AttachmentsService.originalAttachments.length){
                            AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                            $scope.ieClearSelectedFile();
                        } else{
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment.'));
                        }

                    }, function (error) {
                        $scope.addingComment = false;
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                setTimeout(function(){
                },
                    100
                );
            };

            if (iframeId.addEventListener){
                iframeId.addEventListener('load', eventHandler, false);
            } else if (iframeId.attachEvent){
                iframeId.attachEvent('onload', eventHandler);
            }
            $scope.addingComment = true;
            form.submit();
        };
        $scope.ieClearSelectedFile = function () {
            $scope.ieFileDescription = '';
        };
        $scope.submitIEAttachment = function () {
            if(EDIT_CASE_CONFIG.showAttachments && $scope.ie8 || EDIT_CASE_CONFIG.showAttachments && $scope.ie9 ) {
                $scope.ieFileUpload(CaseService.kase.case_number);
            }
        }
    }

]);
