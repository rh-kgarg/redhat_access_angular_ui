'use strict';

export default function () {
    return {
        template: require('../views/markdownEditor.jade'),
        restrict: 'A',
        controller: 'MarkdownEditor',
        scope: {
            addingComment: '=',
            onNewCommentKeypress: '&',
            commentTextBoxEnlargen: '=',
            shouldTextboxMinimize: '&'
        }
    };
}
