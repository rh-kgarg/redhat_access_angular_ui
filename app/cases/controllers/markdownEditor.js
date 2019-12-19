'use strict';
import isEmpty from 'lodash/isEmpty';
import { markdownToHTML } from '../../shared/utils';

export default class MarkdownEditor {
    constructor($scope, CaseService, DiscussionService) {
        'ngInject';
        $scope.CaseService = CaseService;
        $scope.DiscussionService = DiscussionService;
        $scope.isPreview = false;
        $scope.markdownToHTML = markdownToHTML;

        $scope.getSelectedText = function () {
            let text = null;
            if (window.getSelection) {
              text = window.getSelection();
            } else if (document.getSelection) {
              text = document.getSelection();
            }
            return text.toString();
        };
        // execCommand is used to manipulate the current editable regions such as
        // form inputs or contentEditable elements.
        // i am using this because undo redo does not work properly for input element after
        // contents changed programmatically for markdown
        $scope.execCommandOnTextarea = function (markdownText) {
            if (document.execCommand) {
                document.execCommand('insertText', false, markdownText);
            }
        };

        $scope.getMarkdownTextEditor = function () {
            return document && document.getElementById('markdownCaseCommentBox');
        }

        $scope.insertText = function (template) {
            if (CaseService.commentText === undefined || CaseService.commentText === null) {
                CaseService.commentText = '';
            }
            const currentText = CaseService.commentText;
            const textArea = $scope.getMarkdownTextEditor();
            const pos = textArea.selectionStart;
            const newText = currentText.substring(0, pos) + template + currentText.substring(pos);
            CaseService.commentText = newText;
            textArea.focus();
            $scope.execCommandOnTextarea(template);
        }

        $scope.wrapSelection = function (templateStart, templateEnd) {
            if (CaseService.commentText === undefined || CaseService.commentText === null) {
                CaseService.commentText = '';
            }
            const currentText = CaseService.commentText;
            const textArea = $scope.getMarkdownTextEditor();
            const posStart = textArea.selectionStart;
            const posEnd = textArea.selectionEnd;
            const selectedText = templateStart + currentText.substring(posStart, posEnd) + templateEnd;
            const newText = currentText.substring(0, posStart) + templateStart +
                currentText.substring(posStart, posEnd) + templateEnd + currentText.substring(posEnd);
            CaseService.commentText = newText;
            textArea.focus();
            $scope.execCommandOnTextarea(selectedText);
        }

        $scope.wrapBasedOnNewLines = function () {
            if (CaseService.commentText === undefined || CaseService.commentText === null) {
                CaseService.commentText = '';
            }
            const currentText = CaseService.commentText;
            const textArea = $scope.getMarkdownTextEditor();
            const posStart = textArea.selectionStart;
            const posEnd = textArea.selectionEnd;
            const selectedText = currentText.substring(posStart, posEnd);
            const splitText = selectedText.split('\n');
            const newText = currentText.substring(0, posStart).concat(
                splitText.map((v) => `- ${v}`).join('\n'),
                '\n',
                currentText.substring(posEnd)
            );
            const selectedTextWithLine = ''.concat(
                splitText.map((v) => `- ${v}`).join('\n')
            );
            CaseService.commentText = newText;
            textArea.focus();
            $scope.execCommandOnTextarea(selectedTextWithLine);
        }

        $scope.bold = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('**TEXT**');
            } else {
                $scope.wrapSelection('**', '**');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.italic = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('_TEXT_');
            } else {
                $scope.wrapSelection('_', '_');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.h1 = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('# HEADING');
            } else {
                $scope.wrapSelection('# ', '');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.h2 = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('## HEADING');
            } else {
                $scope.wrapSelection('## ', '');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.h3 = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('### HEADING');
            } else {
                $scope.wrapSelection('### ', '');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.list = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('- ITEM');
            } else {
                $scope.wrapBasedOnNewLines();
            }
            $scope.onNewCommentKeypress();
        }
        $scope.link = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('[LINK TEXT](URL "TITLE")');
            } else {
                $scope.wrapSelection('[', '](URL "TITLE")');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.quote = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('> QUOTE');
            } else {
                $scope.wrapSelection('> ', '\n');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.code = function () {
            const selectedText = $scope.getSelectedText();
            if (isEmpty(selectedText)) {
                $scope.insertText('~~~\nCODE\n~~~\n');
            } else {
                $scope.wrapSelection('~~~\n', '\n~~~\n');
            }
            $scope.onNewCommentKeypress();
        }
        $scope.togglePreview = function () {
            $scope.isPreview = !$scope.isPreview;
        }
    }
}