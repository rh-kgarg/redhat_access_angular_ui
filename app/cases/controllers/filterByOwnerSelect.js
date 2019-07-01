'use strict';

import cloneDeep from "lodash/cloneDeep";

export default class FilterByOwnerSelect {
    constructor($rootScope, $scope, FilterService, CaseService, SearchCaseService, securityService) {
        let isFilterInitialized = false;

        $scope.FilterService = FilterService;
        $scope.filterByMeAsOwner = FilterService.getPreviousFilter('case_contactName', FilterService.defaultFilterByMeOptionKeys.all);

        // The options and default setting for filtering by cases owned by the current user.
        $scope.defaultFilterByMeAsOwnerOptions = {
            all: 'All owned cases',
            me: 'Owned by me',
            notme: 'Not owned by me',
        };

        $scope.filterByQueries = {
            meQuery: () => `case_contactName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            notMeQuery: () => `NOT case_contactName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            userQuery: () => `case_contactName:"${$scope.filterByMeAsOwner}"`
        };

        function initializeOptions() {
            $scope.filterByMeAsOwnerOptions = cloneDeep($scope.defaultFilterByMeAsOwnerOptions);
            Object.keys(FilterService.usersObject).forEach((key) => $scope.filterByMeAsOwnerOptions[key] = FilterService.usersObject[key]);
        }

        if (CaseService.users.length > 0) {
            initializeOptions();
        }

        $scope.$watchCollection(() => securityService.loginStatus.authedUser, (nv) => {
            if (nv && nv.loggedInUser && CaseService.users.length === 0) {
                CaseService.populateUsers();
            }
        });

        $scope.$watchCollection(() => FilterService.usersObject, (nv, ov) => {
            if (nv && nv !== ov) {
                initializeOptions();
            }
        });

        $scope.$watchCollection(() => SearchCaseService.searchParameters.queryParams, (nv, ov) => {
            if (nv && nv !== ov && !isFilterInitialized) {
                isFilterInitialized = true;
                $scope.filterByMeAsOwner = FilterService.onFilterByMeQueryParamChange($scope.filterByQueries.meQuery(), $scope.filterByQueries.notMeQuery(), 'case_contactName:');
            }
        });
    }
}
