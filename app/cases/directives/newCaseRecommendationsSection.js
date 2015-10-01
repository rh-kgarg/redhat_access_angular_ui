'use strict';
/*jshint unused:vars */
angular.module('RedhatAccess.cases').directive('rhaNewcaserecommendations', function ($parse) {

	return {
        templateUrl: 'cases/views/newCaseRecommendationsSection.html',
        restrict: 'A',
        controller: 'NewCaseRecommendationsController',
        scope: { itemsPerPage: '=?itemsPerPage' }
    };
});
