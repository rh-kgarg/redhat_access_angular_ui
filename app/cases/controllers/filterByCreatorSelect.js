'use strict';

import cloneDeep from "lodash/cloneDeep";

export default class FilterByCreatorSelect {
    constructor($rootScope, $scope, FilterService, CaseService, SearchCaseService, securityService) {
        let isFilterInitialized = false;

        $scope.FilterService = FilterService;
        $scope.filterByMeAsCreator = FilterService.defaultFilterByMeOptionKeys.all;

        // The options and default setting for filtering by cases created by the current user.
        $scope.defaultFilterByMeAsCreatorOptions = {
            all: 'All created cases',
            me: 'Created by me',
            notme: 'Not created by me'
        };

        $scope.filterByQueries = {
            meQuery: () => `case_createdByName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            notMeQuery: () => `NOT case_createdByName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            userQuery: () => `case_createdByName:"${$scope.filterByMeAsCreator}"`
        };

        $scope.$watchCollection(() => FilterService.usersObject, (nv, ov) => {
            if (nv && nv !== ov) {
                $scope.filterByMeAsCreatorOptions = cloneDeep($scope.defaultFilterByMeAsCreatorOptions);
                Object.keys(FilterService.usersObject).forEach((key) => $scope.filterByMeAsCreatorOptions[key] = FilterService.usersObject[key]);
            }
        });

        $scope.$watchCollection(()=> SearchCaseService.searchParameters.queryParams, (nv, ov) => {
            if (nv && nv !== ov && !isFilterInitialized) {
                $scope.filterByMeAsCreator = FilterService.onFilterByMeQueryParamChange($scope.filterByQueries.meQuery(), $scope.filterByQueries.notMeQuery(), 'case_createdByName:');
            }
        });
    }
}
