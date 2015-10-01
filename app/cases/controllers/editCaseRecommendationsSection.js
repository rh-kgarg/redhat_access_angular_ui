'use strict';
/*jshint camelcase: false*/
angular.module('RedhatAccess.cases').controller('EditCaseRecommendationsController', [
    'RecommendationsService',
    '$scope',
    'strataService',
    'CaseService',
    'AlertService',
    function (RecommendationsService, $scope, strataService, CaseService, AlertService) {
        $scope.RecommendationsService = RecommendationsService;
        $scope.currentRecPin = {};
        $scope.itemsPerPage = 3;

        $scope.pinnedResults = {};
        $scope.handPickedResults = {};
        $scope.results = {};
        $scope.pinnedResultsPage = 1;
        $scope.handPickedResultsPage = 1;
        $scope.resultsPage = 1;
        $scope.isHandpickedSolutionsOpen = {val:false};
        $scope.isTopSolutionsOpen = {val:true};
        $scope.isPinnedSolutionsOpen = {val:false};

        $scope.selectPage = function (pageNum, recommendationsList, results) {
            var start = $scope.itemsPerPage * (pageNum - 1);
            var end = start + $scope.itemsPerPage;
            end = end > recommendationsList.length ? recommendationsList.length : end;
            results.array = recommendationsList.slice(start, end);
        };

        $scope.findLastPage = function (recommendationsList) {
            return Math.ceil(recommendationsList.length / $scope.itemsPerPage);
        };
        $scope.pinRecommendation = function (recommendation) {
            $scope.currentRecPin = recommendation;
            $scope.currentRecPin.pinning = true;
            var doPut = function (linked) {
                var recJSON = {
                    recommendations: {
                        recommendation: [{
                            linked: linked.toString(),
                            resourceId: recommendation.resource_id,
                            resourceType: recommendation.resource_type
                        }]
                    }
                };
                strataService.cases.put(CaseService.kase.case_number, recJSON).then(function () {
                    if (!$scope.currentRecPin.pinned) {
                        //not currently pinned, so add it to the pinned list
                        RecommendationsService.pinnedRecommendations.push($scope.currentRecPin);
                    } else {
                        //currently pinned, so remove from pinned list
                        angular.forEach(RecommendationsService.pinnedRecommendations, function (rec, index) {
                            if (rec.resource_id === $scope.currentRecPin.resource_id) {
                                RecommendationsService.pinnedRecommendations.splice(index, 1);
                                //after removal of recommendation from list, we should check for last page possibility if the current page is greater than last page, we should navigate to previous page
                                if($scope.findLastPage(RecommendationsService.pinnedRecommendations) < $scope.pinnedResultsPage && $scope.pinnedResultsPage > 1) {
                                    $scope.pinnedResultsPage = $scope.pinnedResultsPage - 1;
                                }
                            }
                        });

                        //add the de-pinned rec to the top of the list
                        //this allows the user to still view the rec, or re-pin it
                        //RecommendationsService.recommendations.splice(0, 0, $scope.currentRecPin);
                    }
                    $scope.currentRecPin.pinning = false;
                    $scope.currentRecPin.pinned = !$scope.currentRecPin.pinned;

                    //we need to update top solution section with pinned/unpinned recommendation
                    angular.forEach(RecommendationsService.recommendations, function (rec, index) {
                        if (rec.resource_id === $scope.currentRecPin.resource_id) {
                            RecommendationsService.recommendations[index] = $scope.currentRecPin;
                        }
                    });
                }, function (error) {
                    $scope.currentRecPin.pinning = false;
                    AlertService.addStrataErrorMessage(error);
                });
            };
            if (recommendation.pinned) {
                doPut(false);
            } else {
                doPut(true);
            }
        };
        $scope.triggerAnalytics = function ($event) {
            if (window.chrometwo_require !== undefined) {
                chrometwo_require(['analytics/main'], function (analytics) {
                    analytics.trigger('CaseViewRecommendationClick', $event);
                });
            }
        };
        $scope.increment = function(page){
            $scope[page] = $scope[page] + 1;
        };

        $scope.decrement = function(page){
            $scope[page] = $scope[page] - 1;
        };
        $scope.$watch(function () {
            return RecommendationsService.recommendations;
        }, function () {
            $scope.selectPage($scope.resultsPage, RecommendationsService.recommendations, $scope.results);
        }, true);
        $scope.$watch(function () {
            return RecommendationsService.pinnedRecommendations;
        }, function () {
            $scope.selectPage($scope.pinnedResultsPage, RecommendationsService.pinnedRecommendations, $scope.pinnedResults);
        }, true);
        $scope.$watch(function () {
            return RecommendationsService.handPickedRecommendations;
        }, function () {
            $scope.selectPage($scope.handPickedResultsPage, RecommendationsService.handPickedRecommendations, $scope.handPickedResults);
        }, true);
    }
]);
