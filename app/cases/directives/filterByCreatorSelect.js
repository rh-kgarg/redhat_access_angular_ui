'use strict';

export default function () {
    return {
        template: require('../views/filterByCreatorSelect.jade'),
        restrict: 'A',
        controller: 'FilterByCreatorSelect',
        scope: {
            onchange: '&'
        }
    };
}
