'use strict';
/*jshint camelcase: false, expr: true*/
angular.module('RedhatAccess.cases').controller('NewCaseRecommendationsController', [
    '$scope',
    '$location',
    'SearchResultsService',
    'SEARCH_CONFIG',
    'securityService',
    'AlertService',
    'RecommendationsService',
    function ($scope, $location, SearchResultsService, SEARCH_CONFIG, securityService, AlertService, RecommendationsService) {
        $scope.SearchResultsService = SearchResultsService;
        $scope.selectedSolution = SearchResultsService.currentSelection;
        $scope.currentSearchData = SearchResultsService.currentSearchData;
        $scope.itemsPerPage = angular.isDefined($scope.itemsPerPage) ? $scope.itemsPerPage : 3;
        $scope.currentPage = 1;
        $scope.lastPage = 1;
        $scope.RecommendationsService = RecommendationsService;
        $scope.selectPage = function (pageNum) {

            var start = $scope.itemsPerPage * (pageNum - 1);
            var end = start + $scope.itemsPerPage;
            end = end > RecommendationsService.recommendations.length ? RecommendationsService.recommendations.length : end;
            $scope.results = RecommendationsService.recommendations.slice(start, end);
            $scope.currentPage = pageNum;
        };
        $scope.triggerAnalytics = function ($event) {
            if (window.chrometwo_require !== undefined && $location.path() === '/case/new') {
                chrometwo_require(['analytics/main'], function (analytics) {
                    analytics.trigger('OpenSupportCaseRecommendationClick', $event);
                    analytics.trigger("ABTestSuccess", $event);
                });
            }
        };
        $scope.findLastPage = function () {
            $scope.lastPage = Math.ceil(RecommendationsService.recommendations.length / $scope.itemsPerPage);
        };
        $scope.$watch(function () {
            return SearchResultsService.currentSelection;
        }, function (newVal) {
            $scope.selectedSolution = newVal;
        });

        $scope.$watch(function () {
            return RecommendationsService.recommendations;
        }, function () {
            $scope.currentPage = 1;
            $scope.selectPage($scope.currentPage);
            $scope.findLastPage();
        }, true);
    }
]);
