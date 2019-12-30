'use strict';
import isEmpty from 'lodash/isEmpty';
import { markdownToHTML } from '../../shared/utils';
import { UndoRedoLogger } from './undoRedoLogger';

export default class MarkdownEditor {
    constructor($scope, CaseService, DiscussionService, CASE_EVENTS) {
        'ngInject';
        $scope.CaseService = CaseService;
        $scope.DiscussionService = DiscussionService;
        $scope.isPreview = false;
        $scope.markdownToHTML = markdownToHTML;

        $scope.undoRedoLogger = new UndoRedoLogger('markdownUndoRedoLogger');
        
        $scope.clearUndoRedoLogger = () => {
            $scope.undoRedoLogger.cleanRedoList();
            $scope.undoRedoLogger.cleanUndoList();
        };
        
        $scope.updateUndoRedoLogger = (value) => {
            if ($scope.undoRedoLogger.getLastRecord() !== value) {
                $scope.undoRedoLogger.updateRecord(value);
            }
        };

        $scope.$watch('CaseService.commentText', function () {
            $scope.isMarkdownEditor && $scope.updateUndoRedoLogger(CaseService.commentText);
        });

        $scope.keydown = (event) => {
            if (event.ctrlKey) {
              switch (event.key) {
                case 'b':
                  $scope.bold();
                  $scope.haltEvent(event);
                  break;
                case 'i':
                  $scope.italic();
                  $scope.haltEvent(event);
                  break;
                case '1':
                  $scope.h1();
                  $scope.haltEvent(event);
                  break;
                case '2':
                  $scope.h2();
                  $scope.haltEvent(event);
                  break;
                case '3':
                  $scope.h3();
                  $scope.haltEvent(event);
                  break;
                case 'z':
                    $scope.handleUndo();
                    $scope.haltEvent(event);
                    break;
                case 'y':
                    $scope.handleRedo();
                    $scope.haltEvent(event);
                    break;
              }
            }
        };

        $scope.haltEvent = (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
        }

        $scope.handleUndo = () => {
            $scope.undoRedoLogger.undo((lastValue) => {
                $scope.setMdText(lastValue || '');
            });
        }
        
        $scope.handleRedo = () => {
            $scope.undoRedoLogger.redo((value) => {
                $scope.setMdText(value || '');
            });
        }

        $scope.setMdText = (value = '') => {
            CaseService.commentText = value;
            $scope.onNewCommentKeypress();
        }

        $scope.getSelectedText = function () {
            const currentText = CaseService.commentText || '';
            const textArea = $scope.getMarkdownTextEditor();
            return (currentText && currentText.substring(textArea.selectionStart, textArea.selectionEnd)) || '';
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
        }

        $scope.wrapSelection = function (templateStart, templateEnd) {
            if (CaseService.commentText === undefined || CaseService.commentText === null) {
                CaseService.commentText = '';
            }
            const currentText = CaseService.commentText;
            const textArea = $scope.getMarkdownTextEditor();
            const posStart = textArea.selectionStart;
            const posEnd = textArea.selectionEnd;
            const newText = currentText.substring(0, posStart) + templateStart +
                currentText.substring(posStart, posEnd) + templateEnd + currentText.substring(posEnd);
            CaseService.commentText = newText;
            textArea.focus();
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
            CaseService.commentText = newText;
            textArea.focus();
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

        $scope.$on(CASE_EVENTS.postCommentOnCase, function () {
            $scope.isPreview = false;
            $scope.clearUndoRedoLogger();
        });
    }
}