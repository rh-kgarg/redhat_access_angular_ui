'use strict';

export default function () {
    return {
        template: require('../views/filterByOwnerSelect.jade'),
        restrict: 'A',
        controller: 'FilterByOwnerSelect',
        scope: {
            onchange: '&'
        }
    };
}
