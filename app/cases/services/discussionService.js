'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').service('DiscussionService', [
    '$location',
    '$q',
    'AlertService',
    'AttachmentsService',
    'CaseService',
    'strataService',
    'HeaderService',
    'COMMON_CONFIG',
    function ($location, $q, AlertService, AttachmentsService, CaseService, strataService, HeaderService, COMMON_CONFIG) {
        this.discussionElements = [];
        this.chatTranscriptList = [];
        this.comments = CaseService.comments;
        this.attachments = AttachmentsService.originalAttachments;
        this.loadingAttachments = false;
        this.loadingComments = false;
        this.commentTextBoxEnlargen = false;
        this.getDiscussionElements = function(caseId){
            var attachPromise = null;
            var commentsPromise = null;
            this.discussionElements = [];
            //if (EDIT_CASE_CONFIG.showAttachments) {
            
            if(!COMMON_CONFIG.isGS4){
                this.loadingAttachments = true;
                attachPromise = strataService.cases.attachments.list(caseId).then(angular.bind(this, function (attachmentsJSON) {
                    AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                    //this.attachments = AttachmentsService.originalAttachments;
                    //this.discussionElements = this.discussionElements.concat(this.attachments);
                    this.loadingAttachments= false;
                }), angular.bind(this, function (error) {
                    if(!HeaderService.pageLoadFailure) {
                        AlertService.addStrataErrorMessage(error);
                    }
                    this.loadingAttachments= false;
                }));
            }
            commentsPromise = CaseService.populateComments(caseId).then(function () {
            }, function (error) {
                if(!HeaderService.pageLoadFailure) {
                    AlertService.addStrataErrorMessage(error);
                }
            });
            //TODO should this be done in case service???
            this.loadingComments = true;
            return $q.all([attachPromise, commentsPromise]);
        };
        this.updateElements = function(){
            this.comments = CaseService.comments;
            this.attachments = AttachmentsService.originalAttachments;
            this.discussionElements = this.comments.concat(this.attachments);
            if (this.chatTranscriptList !== undefined && this.chatTranscriptList.length > 0) {
                this.discussionElements = this.discussionElements.concat(this.chatTranscriptList);
            }
        };
    }
]);
