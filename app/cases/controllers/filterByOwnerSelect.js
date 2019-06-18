'use strict';

import remove from "lodash/remove";
import cloneDeep from "lodash/cloneDeep";

export default class FilterByOwnerSelect {
    constructor($rootScope, $scope, CaseService, SearchCaseService, securityService, RHAUtils, CASE_EVENTS) {
        // The options and default setting for filtering by cases owned by the current user.
        $scope.defaultFilterByMeAsOwnerOptions = {
            all: 'All owned cases',
            me: 'Owned by me',
            notme: 'Not owned by me',
        };

        $scope.filterByMeAsOwnerQueries = {
            meQuery: () => `case_contactName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            notMeQuery: () => `NOT case_contactName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            userQuery: () => `case_contactName:"${$scope.filterByMeAsOwner}"`
        };

        $scope.filterByMeAsOwner = 'all';
        $scope.onFilterByMeAsOwnerChange = () => {
            const meQuery = $scope.filterByMeAsOwnerQueries.meQuery();
            const notMeQuery = $scope.filterByMeAsOwnerQueries.notMeQuery();
            const userQuery = $scope.filterByMeAsOwnerQueries.userQuery();
            SearchCaseService.searching = true;
            SearchCaseService.currentPage = 1;

            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_contactName:'));

            if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                SearchCaseService.searchParameters.queryParams = [];
            }

            if ($scope.filterByMeAsOwner === $scope.defaultFilterByMeAsOwnerOptions.me) {
                SearchCaseService.searchParameters.queryParams.push(meQuery);
            } else if ($scope.filterByMeAsOwner === $scope.defaultFilterByMeAsOwnerOptions.notme) {
                SearchCaseService.searchParameters.queryParams.push(notMeQuery);
            } else if ($scope.filterByMeAsOwner !== $scope.defaultFilterByMeAsOwnerOptions.all) {
                SearchCaseService.searchParameters.queryParams.push(userQuery);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };

        $scope.$watch(() => CaseService.users, (nv, ov) => {
            if (nv && nv && nv !== ov) {
                $scope.filterByMeAsOwnerOptions = cloneDeep($scope.defaultFilterByMeAsOwnerOptions);

                CaseService.users.forEach((user) => {
                    const firstLastName = `${user.first_name} ${user.last_name}`;
                    const optionValue = `${firstLastName} <${user.sso_username}>`;
                    $scope.filterByMeAsOwnerOptions[firstLastName] = optionValue;
                });

                console.log($scope.filterByMeAsOwner)
            }
        });

        $scope.$watch('SearchCaseService.searchParameters.queryParams', (nv) => {
            const meOwnerQuery = $scope.filterByMeAsOwnerQueries.meQuery();
            const notMeOwnerQuery = $scope.filterByMeAsOwnerQueries.notMeQuery();

            if (nv && nv.length > 0) {
                const query = SearchCaseService.searchParameters.queryParams.find((v) => v.includes('case_contactName:'));
                const hasMeOwnerQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === meOwnerQuery);
                const hasNotMeOwnerQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === notMeOwnerQuery);

                if (hasMeOwnerQuery) {
                    $scope.filterByMeAsOwner = $scope.defaultFilterByMeAsOwnerOptions.me;
                } else if (hasNotMeOwnerQuery) {
                    $scope.filterByMeAsOwner = $scope.defaultFilterByMeAsOwnerOptions.notme;
                } else if (query) {
                    $scope.filterByMeAsOwner = query.split(':')[1].replace('"', '');
                }
            }
        });
    }
}
