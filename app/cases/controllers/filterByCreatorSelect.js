'use strict';

import remove from "lodash/remove";
import cloneDeep from "lodash/cloneDeep";

export default class FilterByCreatorSelect {
    constructor($rootScope, $scope, CaseService, SearchCaseService, securityService, RHAUtils, CASE_EVENTS) {
        // The options and default setting for filtering by cases created by the current user.
        $scope.defaultFilterByMeAsCreatorOptions = {
            all: 'All created cases',
            me: 'Created by me',
            notme: 'Not created by me'
        };

        $scope.filterByMeAsCreatorQueries = {
            meQuery: () => `case_createdByName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            notMeQuery: () => `NOT case_createdByName:"${securityService.loginStatus.authedUser.loggedInUser}"`,
            userQuery: () => `case_createdByName:"${$scope.filterByMeAsCreator}"`
        };

        $scope.filterByMeAsCreator = 'all';
        $scope.onFilterByMeAsCreatorChange = () => {
            const meQuery = $scope.filterByMeAsCreatorQueries.meQuery();
            const notMeQuery = $scope.filterByMeAsCreatorQueries.notMeQuery();
            const userQuery = $scope.filterByMeAsCreatorQueries.userQuery();
            SearchCaseService.searching = true;
            SearchCaseService.currentPage = 1;

            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes('case_createdByName:'));

            if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                SearchCaseService.searchParameters.queryParams = [];
            }

            if ($scope.filterByMeAsCreator === $scope.defaultFilterByMeAsCreatorOptions.me) {
                SearchCaseService.searchParameters.queryParams.push(meQuery);
            } else if ($scope.filterByMeAsCreator === $scope.defaultFilterByMeAsCreatorOptions.notme) {
                SearchCaseService.searchParameters.queryParams.push(notMeQuery);
            } else if ($scope.filterByMeAsCreator !== $scope.defaultFilterByMeAsCreatorOptions.all) {
                SearchCaseService.searchParameters.queryParams.push(userQuery);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };


        $scope.$watch(() => CaseService.users, (nv, ov) => {
            if (nv && nv !== ov) {
                $scope.filterByMeAsCreatorOptions = cloneDeep($scope.defaultFilterByMeAsCreatorOptions);

                CaseService.users.forEach((user) => {
                    const firstLastName = `${user.first_name} ${user.last_name}`;
                    const optionValue = `${firstLastName} <${user.sso_username}>`;
                    $scope.filterByMeAsCreatorOptions[firstLastName] = optionValue;
                });
            }
        });

        $scope.$watch('SearchCaseService.searchParameters.queryParams', (nv) => {
            const meCreatorQuery = $scope.filterByMeAsCreatorQueries.meQuery();
            const notMeCreatorQuery = $scope.filterByMeAsCreatorQueries.notMeQuery();

            if (nv && nv.length > 0) {
                const query = SearchCaseService.searchParameters.queryParams.find((v) => v.includes('case_createdByName:'));
                const hasMeCreatorQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === meCreatorQuery);
                const hasNotMeCreatorQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === notMeCreatorQuery);

                if (hasMeCreatorQuery) {
                    $scope.filterByMeAsCreator = $scope.defaultFilterByMeAsCreatorOptions.me;
                } else if (hasNotMeCreatorQuery) {
                    $scope.filterByMeAsCreator = $scope.defaultFilterByMeAsCreatorOptions.notme;
                } else if (query) {
                    $scope.filterByMeAsCreator = query.split(':')[1].replace('"', '');
                }
            }
        });
    }
}
