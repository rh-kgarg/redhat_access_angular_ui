'use strict';

export default class AddCommentSection {
    constructor($scope, strataService, CaseService, AlertService, AttachmentsService, DiscussionService, securityService, $timeout, RHAUtils, EDIT_CASE_CONFIG, gettextCatalog, SearchCaseService) {
        'ngInject';

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

        const updateAttachments = async () => {
            try {
                strataService.cache.clr('attachments' + CaseService.kase.case_number);
                await AttachmentsService.updateAttachments(CaseService.kase.case_number);
                $scope.addingattachment = false;
            } catch(error) {
                $scope.addingattachment = false;
            }
        };

        $scope.$watch('AttachmentsService.uploadingAttachments', async (newVal, oldVal) => {
            if (oldVal && !newVal) {
                await DiscussionService.getDiscussionElements(CaseService.kase.case_number);
            }
        });

        $scope.clearComment = function () {
            CaseService.commentText = '';
            DiscussionService.commentTextBoxEnlargen = false;
            CaseService.localStorageCache.remove(CaseService.kase.case_number + securityService.loginStatus.authedUser.sso_username);
            AttachmentsService.updatedAttachments = [];
            CaseService.disableAddComment = true;
        };

        $scope.addComment = function () {
            if (!securityService.loginStatus.authedUser.is_internal) {
                CaseService.isCommentPublic = true;
            }
            var onSuccess = function () {
                SearchCaseService.clear();
                CaseService.isCommentPublic = true;
                CaseService.draftCommentOnServerExists = false;
                if (CaseService.localStorageCache) {
                    CaseService.localStorageCache.remove(CaseService.kase.case_number + securityService.loginStatus.authedUser.sso_username);
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

                if ( // if user adding the comment is not watching this case add him now
                    securityService.loginStatus.authedUser.sso_username !== undefined
                    && CaseService.kase.contact_sso_username != securityService.loginStatus.authedUser.sso_username
                    && CaseService.originalNotifiedUsers.indexOf(securityService.loginStatus.authedUser.sso_username) === -1
                ) {
                    strataService.cases.notified_users.add(CaseService.kase.case_number, securityService.loginStatus.authedUser.sso_username).then(function () {
                        CaseService.originalNotifiedUsers.push(securityService.loginStatus.authedUser.sso_username);
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
            if (!CaseService.disableAddComment && CaseService.commentText !== 'undefined') {
                $scope.addingComment = true;
                if (CaseService.localStorageCache) {
                    if (CaseService.draftCommentOnServerExists) {
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
                window.sessionjs.updateToken(true).success(() => {
                    updateAttachments();
                }).error(() => {
                    AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment.'));
                });
            }
        };
        $scope.saveDraftPromise;
        $scope.onNewCommentKeypress = function () {
            if (CaseService.localStorageCache) {
                if (CaseService.draftCommentOnServerExists) {
                    CaseService.draftCommentLocalStorage = {
                        'text': CaseService.commentText,
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
                if (RHAUtils.isEmpty(CaseService.commentText)) {
                    CaseService.draftCommentLocalStorage.public = true;
                }
                CaseService.localStorageCache.put(CaseService.kase.case_number + securityService.loginStatus.authedUser.sso_username, CaseService.draftCommentLocalStorage);
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
            if (RHAUtils.isNotEmpty(CaseService.commentText) && CaseService.commentText !== CaseService.commentReplyText) {
                $scope.onNewCommentKeypress();
            }

        };
        $scope.$watch('CaseService.commentText', function () {
            $scope.maxCharacterCheck();
        });
        $scope.maxCharacterCheck = function () {
            if (CaseService.commentText !== undefined && $scope.maxCommentLength >= CaseService.commentText.length) {
                var count = CaseService.commentText.length * 100 / $scope.maxCommentLength;
                parseInt(count);
                $scope.progressCount = Math.round(count * 100) / 100;
                var breakMatches = CaseService.commentText.match(/(\r\n|\n|\r)/g);
                var numberOfLineBreaks = 0;
                if (breakMatches) {
                    numberOfLineBreaks = breakMatches.length;
                }
                $scope.charactersLeft = $scope.maxCommentLength - CaseService.commentText.length - numberOfLineBreaks;
                if ($scope.charactersLeft < 0) {
                    $scope.charactersLeft = 0;
                }
            }
            else if (CaseService.commentText === undefined) {
                $scope.progressCount = 0;
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
        $scope.shouldTextboxMinimize = function () {
            if (RHAUtils.isEmpty(CaseService.commentText)) {
                DiscussionService.commentTextBoxEnlargen = false;
            }
        };
        $scope.ieFileUpload = function ($event) {
            var form = document.getElementById('fileUploaderForm');
            var iframeId = document.getElementById('upload_target');
            form.action = 'https://' + window.location.host + '/rs/cases/' + CaseService.kase.case_number + '/attachments';

            var eventHandler = function () {
                if (iframeId.removeEventListener) {
                    iframeId.removeEventListener('load', eventHandler, false);
                } else if (iframeId.detachEvent) {
                    iframeId.detachEvent('onload', eventHandler);
                }
                if (!$scope.ie8) {
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
                        if (splitPath !== undefined && splitPath[4] !== undefined) {
                            AttachmentsService.clear();
                            updateAttachments().then(function (attachmentsJSON) {
                                $scope.ieClearSelectedFile();
                                SearchCaseService.clear();
                            }, function (error) {
                                AlertService.addStrataErrorMessage(error);
                            });
                        } else {
                            $scope.addingComment = false;
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}', {errorMessage: content}));
                            $scope.$apply();
                        }
                    } else {
                        $scope.addingComment = false;
                        AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message: {{errorMessage}}', {errorMessage: content}));
                        $scope.$apply();
                    }
                } else {
                    updateAttachments().then(function (attachmentsJSON) {
                        SearchCaseService.clear();
                        if (attachmentsJSON.length !== AttachmentsService.originalAttachments.length) {
                            $scope.ieClearSelectedFile();
                        } else {
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment.'));
                        }

                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                setTimeout(function () {
                    },
                    100
                );
            };

            if (iframeId.addEventListener) {
                iframeId.addEventListener('load', eventHandler, false);
            } else if (iframeId.attachEvent) {
                iframeId.attachEvent('onload', eventHandler);
            }
            $scope.addingComment = true;
            form.submit();
        };
        $scope.ieClearSelectedFile = function () {
            $scope.ieFileDescription = '';
        };
        $scope.submitIEAttachment = function () {
            if (EDIT_CASE_CONFIG.showAttachments && $scope.ie8 || EDIT_CASE_CONFIG.showAttachments && $scope.ie9) {
                window.sessionjs.updateToken(true).success(() => {
                    $scope.ieFileUpload(CaseService.kase.case_number);
                }).error(() => {
                    AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment.'));
                });
            }
        }
    }

}
