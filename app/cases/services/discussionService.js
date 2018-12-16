'use strict';

import hydrajs from '../../shared/hydrajs';
import assign from 'lodash/assign';
import filter from 'lodash/filter';


export default class DiscussionService {
    constructor($sce, $location, $q, AlertService, RHAUtils, AttachmentsService, CaseService, strataService, HeaderService, securityService, COMMON_CONFIG, SearchBoxService) {
        'ngInject';

        this.discussionElements = [];
        this.chatTranscriptList = [];
        this.comments = CaseService.comments;
        this.attachments = AttachmentsService.originalAttachments;
        this.externalUpdates = CaseService.externalUpdates;
        this.loadingComments = false;
        this.commentTextBoxEnlargen = false;

        this.getDiscussionElements = function (caseId) {
            var attachPromise = null;
            var commentsPromise = null;
            var externalUpdatesPromise = null;
            this.discussionElements = [];
            if (!COMMON_CONFIG.isGS4) {
                attachPromise = AttachmentsService.getAttachments(caseId)
                    .then(() => this.updateElements());
            }
            commentsPromise = CaseService.populateComments(caseId).then(function () {
            }, function (error) {
                if (!HeaderService.pageLoadFailure) {
                    AlertService.addStrataErrorMessage(error);
                }
            });
            externalUpdatesPromise = CaseService.populateExternalUpdates(caseId).then(function () {
            }, function (error) {
                if (!HeaderService.pageLoadFailure) {
                    AlertService.addStrataErrorMessage(error);
                }
            });
            //TODO should this be done in case service???
            this.loadingComments = true;
            if (COMMON_CONFIG.isGS4) {
                return $q.all([commentsPromise, externalUpdatesPromise]);
            }
            return $q.all([attachPromise, commentsPromise, externalUpdatesPromise]);

        };

        this.doSearch = function (searchTerm) {
            const allDiscussionElements = this.makeDiscussionElements();
            console.log(allDiscussionElements.length, "allDiscussionElements.length");

            if((searchTerm || '').trim() == '') {
                this.discussionElements = allDiscussionElements;
                return;
            }

            const results = filter(allDiscussionElements, ((element) => {
                const text = element && element.text;
                if (text) {
                    const matchIndex = text.search(new RegExp(searchTerm, 'gi'));
                    const matchFound = matchIndex > -1;
                    if (matchFound) {
                        console.log(text, matchIndex);
                    }
                    return matchFound;
                }
                // return text && (text.search(new RegExp(searchTerm, 'gi')) > -1);
            }));
            console.log(results.length, "results.length");
            this.discussionElements = results;
        }

        this.makeDiscussionElements = () => {
            let _discussionElements = CaseService.comments
                .concat(AttachmentsService.originalAttachments)
                .concat(CaseService.externalUpdates);
            if (this.chatTranscriptList !== undefined && this.chatTranscriptList.length > 0) {
                _discussionElements = _discussionElements.concat(this.chatTranscriptList);
            }
            return _discussionElements;
        }

        this.updateElements = function () {
            this.comments = CaseService.comments;
            this.attachments = AttachmentsService.originalAttachments;
            this.externalUpdates = CaseService.externalUpdates;
            this.discussionElements = this.makeDiscussionElements();
        };
    }
}
