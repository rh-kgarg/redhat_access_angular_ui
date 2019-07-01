'use strict';

export default function () {
    return {
        template: require('../views/versionFilterSelect.jade'),
        restrict: 'A',
        controller: 'VersionFilterSelect'
    };
}
