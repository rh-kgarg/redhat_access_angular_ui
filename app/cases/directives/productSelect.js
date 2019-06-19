'use strict';

export default function () {
    return {
        template: require('../views/productSelect.jade'),
        restrict: 'A',
        controller: 'ProductSelect',
        scope: {
            onchange: '&',
            placeholder: '<?',
            isFilter: '<?'
        }
    };
}
