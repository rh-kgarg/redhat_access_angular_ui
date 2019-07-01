'use strict';

export default function () {
    return {
        template: require('../views/productFilterSelect.jade'),
        restrict: 'A',
        controller: 'ProductFilterSelect'
    };
}
