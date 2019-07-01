'use strict';

import remove from "lodash/remove";

export default class FilterService {
    constructor($rootScope, CaseService, SearchCaseService, CASE_EVENTS, RHAUtils) {
        'ngInject';

        // key value pair of the users first and last name as the key and the value as a the first and last name
        // followed by the sso_username.
        this.usersObject = {};
        this.defaultFilterByMeOptionKeys = {
            all: 'all',
            me: 'me',
            notme: 'notme'
        };

        this.onFilterByMe = (currentFilter, meQuery, notMeQuery, userQuery, queryFlString) => {
            SearchCaseService.searching = true;
            SearchCaseService.currentPage = 1;

            remove(SearchCaseService.searchParameters.queryParams, (v) => v.includes(queryFlString));

            if (RHAUtils.isEmpty(SearchCaseService.searchParameters.queryParams)) {
                SearchCaseService.searchParameters.queryParams = [];
            }

            if (currentFilter === this.defaultFilterByMeOptionKeys.me) {
                SearchCaseService.searchParameters.queryParams.push(meQuery);
            } else if (currentFilter === this.defaultFilterByMeOptionKeys.notme) {
                SearchCaseService.searchParameters.queryParams.push(notMeQuery);
            } else if (currentFilter !== this.defaultFilterByMeOptionKeys.all) {
                SearchCaseService.searchParameters.queryParams.push(userQuery);
            }

            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };

        $rootScope.$watch(() => CaseService.users, (nv, ov) => {
            if (nv && nv !== ov) {
                CaseService.users.forEach((user) => {
                    const firstLastName = `${user.first_name} ${user.last_name}`;
                    const optionValue = `${firstLastName} <${user.sso_username}>`;
                    this.usersObject[firstLastName] = optionValue;
                });
            }
        });

        this.getPreviousFilter = (filterName) => {
            if (SearchCaseService.searchParameters && SearchCaseService.searchParameters.queryParams) {
                const query = SearchCaseService.searchParameters.queryParams.find((v) => v.includes(filterName));
                return query.split(':')[1].replace(/['"]+/g, '');
            }
        };

        this.onFilterByMeQueryParamChange = (meQuery, notMeQuery, queryFlString) => {
            const query = SearchCaseService.searchParameters.queryParams.find((v) => v.includes(queryFlString));
            const hasMeQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === meQuery);
            const hasNotMeQuery = !!SearchCaseService.searchParameters.queryParams.find((v) => v === notMeQuery);

            if (hasMeQuery) {
                return this.defaultFilterByMeOptionKeys.me;
            } else if (hasNotMeQuery) {
                return this.defaultFilterByMeOptionKeys.notme;
            } else if (query) {
                return query.split(':')[1].replace(/['"]+/g, '');
            } else {
                return this.defaultFilterByMeOptionKeys.all;
            }
        };
    }
}
