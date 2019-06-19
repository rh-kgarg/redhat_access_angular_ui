'use strict';

export default function () {
    return {
        template: require('../views/versionSelect.jade'),
        restrict: 'A',
        controller: 'VersionSelect',
        scope: {
            placeholder: '<?',
            isFilter: '<?'
        }
    };
}
