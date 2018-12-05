'use strict';

import hydrajs from '../../shared/hydrajs';

export default class DiscussionSection {
    constructor($scope, $timeout, AttachmentsService, CaseService, DiscussionService, securityService, $stateParams, AlertService, $uibModal,
                $location, RHAUtils, EDIT_CASE_CONFIG, AUTH_EVENTS, CASE_EVENTS, $sce, gettextCatalog, LinkifyService, SearchCaseService, COMMON_CONFIG) {
        'ngInject';

        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.securityService = securityService;
        $scope.ie8 = window.ie8;
        $scope.ie9 = window.ie9;
        $scope.noteCharactersMax = 255;
        $scope.noteCharactersLeft = $scope.noteCharactersMax;
        $scope.EDIT_CASE_CONFIG = EDIT_CASE_CONFIG;
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.discussion = true;
        $scope.attachments = false;
        $scope.notes = false;
        $scope.caseSummary = false;
        $scope.bugzillas = false;
        $scope.hasScrolled = false;
        $scope.commentSortOrder = true;
        $scope.commentSortOrderList = [
            {
                name: gettextCatalog.getString('Newest to Oldest'),
                sortOrder: 'DESC'
            },
            {
                name: gettextCatalog.getString('Oldest to Newest'),
                sortOrder: 'ASC'
            }
        ];

        $scope.DiscussionService = DiscussionService;

        $scope.getPaginationData = (pageSize, currentPage) => {
            $scope.pageSize = pageSize;
            $scope.currentPage = currentPage;
        };

        var scroll = function (commentId) {
            $timeout(function () {
                if (!$scope.hasScrolled && angular.element(commentId)) {
                    CaseService.scrollToComment(commentId);
                }
                else {
                    scroll(commentId);
                }
            }, 150);
        };

        $scope.init = function () {
            DiscussionService.getDiscussionElements($stateParams.id).then(angular.bind(this, function () {
                if ($location.search().commentId !== undefined) {
                    scroll($location.search().commentId);
                }
            }, function (error) {
            }));
        };

        if (securityService.loginStatus.isLoggedIn) {
            $scope.init();
        }
        $scope.authLoginEvent = $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            $scope.init();
        });

        $scope.commentReply = function (comment) {
            var truncatedText = comment.text.substring(0, 1000);
            var person = comment.created_by;
            var lines = truncatedText.split(/\n/);
            truncatedText = gettextCatalog.getString('(In reply to {{personName}})', {personName: person}) + '\n';
            for (var i = 0, max = lines.length; i < max; i++) {
                truncatedText = truncatedText + '> ' + lines[i] + '\n';
            }
            var commentsSection = document.getElementById('tab_list');
            if (commentsSection) {
                commentsSection.scrollIntoView(true);
            }
            CaseService.commentText = truncatedText;
            CaseService.commentReplyText = truncatedText;
            CaseService.disableAddComment = true;
        };

        $scope.requestManagementEscalation = function () {
            $uibModal.open({
                template: require('../views/requestManagementEscalationModal.jade'),
                controller: 'RequestManagementEscalationModal'
            });
        };

        $scope.deleteAttachment = function (element) {
            AttachmentsService.removeOriginalAttachment(element);
        };

        $scope.maxNotesCharacterCheck = function () {
            if (CaseService.kase.notes !== undefined) {
                $scope.noteCharactersLeft = $scope.noteCharactersMax - CaseService.kase.notes.length;
            }
        };

        $scope.applyCommentFeedback = (element, feedback) => {
            CaseService.feedbackComment(element, feedback).then(angular.bind(this, function() {
                DiscussionService.updateElements();
            }), angular.bind(this, function(error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };

        $scope.$watch('AttachmentsService.originalAttachments', function () {
            DiscussionService.updateElements();
            if (AttachmentsService.originalAttachments.length === 0) { //if we are deleting last attachment, we should default to case discussion tab
                $scope.toggleDiscussion();
            }

            $scope.init();
        }, true);
        $scope.$watch('CaseService.comments', function () {
            DiscussionService.updateElements();
        }, true);
        $scope.$watch('CaseService.kase.notes', function () {
            $scope.maxNotesCharacterCheck();
        }, true);

        $scope.updateNotes = function () {
            CaseService.updateCase().then(angular.bind(this, function () {
                this.notesForm.$setPristine();
                SearchCaseService.clear();
            }), angular.bind(this, function (error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };
        $scope.updateActionPlan = function () {
            CaseService.updateCase().then(angular.bind(this, function () {
                this.actionPlanForm.$setPristine();
                SearchCaseService.clear();
            }), angular.bind(this, function (error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };
        $scope.updateCaseSummary = function () {
            CaseService.updateCase().then(angular.bind(this, function () {
                this.caseSummaryForm.$setPristine();
                SearchCaseService.clear();
            }), angular.bind(this, function (error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };
        $scope.discardNotes = function () {
            CaseService.kase.notes = CaseService.prestineKase.notes;
            if (CaseService.kase.notes !== undefined) {
                $scope.noteCharactersLeft = $scope.noteCharactersMax - CaseService.kase.notes.length;
            } else {
                $scope.noteCharactersLeft = $scope.noteCharactersMax;
            }
            this.notesForm.$setPristine();
        };
        $scope.discardActionPlan = function () {
            CaseService.kase.action_plan = CaseService.prestineKase.action_plan;
            this.actionPlanForm.$setPristine();
        };
        $scope.discardCaseSummary = function () {
            CaseService.kase.case_summary = CaseService.prestineKase.case_summary;
            this.caseSummaryForm.$setPristine();
        };
        $scope.toggleDiscussion = function () {
            $scope.discussion = true;
            $scope.attachments = false;
            $scope.notes = false;
            $scope.bugzillas = false;
            $scope.actionPlan = false;
            $scope.caseSummary = false;
        };
        $scope.toggleAttachments = function () {
            $scope.discussion = false;
            $scope.attachments = true;
            $scope.notes = false;
            $scope.bugzillas = false;
            $scope.actionPlan = false;
            $scope.caseSummary = false;
        };
        $scope.toggleNotes = function () {
            $scope.discussion = false;
            $scope.attachments = false;
            $scope.notes = true;
            $scope.bugzillas = false;
            $scope.actionPlan = false;
            $scope.caseSummary = false;
        };
        $scope.toggleBugzillas = function () {
            $scope.discussion = false;
            $scope.attachments = false;
            $scope.notes = false;
            $scope.bugzillas = true;
            $scope.actionPlan = false;
            $scope.caseSummary = false;
        };
        $scope.toggleActionPlan = function () {
            $scope.discussion = false;
            $scope.attachments = false;
            $scope.notes = false;
            $scope.bugzillas = false;
            $scope.actionPlan = true;
            $scope.caseSummary = false;
        };
        $scope.toggleCaseSummary = function () {
            $scope.discussion = false;
            $scope.attachments = false;
            $scope.notes = false;
            $scope.bugzillas = false;
            $scope.actionPlan = false;
            $scope.caseSummary = true;
        };

        $scope.$on('$locationChangeSuccess', function () {
            var splitUrl = $location.path().split('/');
            if (splitUrl[2] !== undefined && $location.path().search(/case\/[0-9]{1,8}/i) !== -1) {
                var newCaseId = splitUrl[2];
                var oldCaseId = $scope.CaseService.kase.case_number;
                if (newCaseId !== oldCaseId) {
                    $stateParams.id = newCaseId;
                    CaseService.clearCase();
                    $scope.init();
                }
            }
        });

        $scope.$on(CASE_EVENTS.received, function () {
            if (CaseService.kase.chats !== undefined && CaseService.kase.chats.chat !== undefined) {
                angular.forEach(CaseService.kase.chats.chat, angular.bind(this, function (chat) {
                    chat.last_modified_date = chat.start_date;
                    chat.last_modified_time = chat.start_time;
                    chat.comment_type = 'chat';
                    DiscussionService.chatTranscriptList.push(chat);
                }));
            } else {
                DiscussionService.chatTranscriptList = [];
            }
            DiscussionService.updateElements();
        });

        $scope.parseCommentHtml = function (comment) {
            var parsedHtml = '';
            if (comment.body !== undefined) {
                if (RHAUtils.isNotEmpty(comment.body)) {
                    var rawHtml = comment.body.toString();
                    parsedHtml = $sce.trustAsHtml(rawHtml);
                }
            } else if (comment.text !== undefined) {
                if (RHAUtils.isNotEmpty(comment.text)) {
                    const matchText = 'Request Management Escalation:';
                    if (comment.text.indexOf(matchText) > -1) {
                        // made red color to RME escalation comment.
                        return $sce.trustAsHtml(comment.text.replace(new RegExp(matchText, "gi"), function(match) {
                            return '<span class="text-danger">' + match + '</span>';
                        }));
                    }
                    parsedHtml = LinkifyService.linkifyWithCaseIDs(comment.text);
                }
            }
            return parsedHtml;
        };

        $scope.onSortOrderChange = function () {
            if (RHAUtils.isNotEmpty(DiscussionService.commentSortOrder)) {
                if (DiscussionService.commentSortOrder.sortOrder === 'ASC') {
                    $scope.commentSortOrder = false;
                } else if (DiscussionService.commentSortOrder.sortOrder === 'DESC') {
                    $scope.commentSortOrder = true;
                }
            }
        };

        // This fetches a signed url from a s3 instance to download the specified file.
        $scope.downloadS3Attachment = (element) => {
            const hydraAttachments = hydrajs.kase.attachments;
            const caseNumber = CaseService.kase.case_number;
            const id = element.uuid;

            hydraAttachments.downloadAttachmentS3(caseNumber, id, element.file_name)
            .catch((error) => {
                AlertService.addDangerMessage(gettextCatalog.getString(`Could not download {{filename}}: {{error}}`, {
                    filename: element.file_name,
                    error: error.message
                }));
            });
        };

        $scope.isCertification = () => CaseService.kase.type.name === 'Certification';
    }
}
