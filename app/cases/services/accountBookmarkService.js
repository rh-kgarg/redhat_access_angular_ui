'use strict';

import _ from 'lodash';
import hydrajs from '../../shared/hydrajs';


export default class AccountBookmarkService {
    constructor(securityService, $rootScope, AUTH_EVENTS, AccountService, RHAUtils, ACCOUNT_EVENTS, strataService, $q) {
        'ngInject';

        this.loading = true;
        this.bookmarkedAccounts = [];

        this.init = function () { // load the bookmarked accounts from the logged in user.
            var user = securityService.loginStatus.authedUser;
            if (RHAUtils.isNotEmpty(user.account_list) && RHAUtils.isNotEmpty(user.account_list.account_number)) {
                this.loading = true;
                var accountPromises = user.account_list.account_number.map(function (number) {
                    return AccountService.loadAccount(number);
                });
                $q.all(accountPromises).then(angular.bind(this, function () {
                    this.bookmarkedAccounts = user.account_list.account_number.map(function (number) {
                        return AccountService.accounts[number];
                    }).filter(function (account) {
                        return account != null; // remove accounts not found
                    });
                    this.loading = false;
                    this.bookmarkedAccounts.sort(function (a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                    $rootScope.$broadcast(ACCOUNT_EVENTS.bookmarkedAccountsFetched);
                }), angular.bind(this, function () {
                    this.loading = false;
                    $rootScope.$broadcast(ACCOUNT_EVENTS.bookmarkedAccountsFetched);
                }));
            } else {
                this.bookmarkedAccounts = [];
                this.loading = false;
                $rootScope.$broadcast(ACCOUNT_EVENTS.bookmarkedAccountsFetched);
            }
        };

        this.isBookmarked = function (accountNumber) {
            return this.bookmarkedAccounts.filter(function (account) {
                    return account.number === accountNumber;
                }).length > 0;
        };

        this.addBookmark = function (account) {
            var user = securityService.loginStatus.authedUser;
            return hydrajs.accounts.bookmarkAccount(user.sso_username, account.number).then(angular.bind(this, function () {
                if (RHAUtils.isNotEmpty(account.name)) {
                    this.bookmarkedAccounts = this.bookmarkedAccounts.concat([_.cloneDeep(account)]);
                } else { //there is no name, we must fetch the account before adding to bookmarked accounts
                    if (RHAUtils.isNotEmpty(AccountService.accounts[account.number])) { // was it already fetched before?
                        this.bookmarkedAccounts = this.bookmarkedAccounts.concat([AccountService.accounts[account.number]]);
                    } else {
                        return AccountService.loadAccount(account.number).then(angular.bind(this, function () {
                            if (RHAUtils.isNotEmpty(AccountService.accounts[account.number])) {
                                this.bookmarkedAccounts = this.bookmarkedAccounts.concat([AccountService.accounts[account.number]]);
                            }
                        }));
                    }
                }
            }));
        };

        this.removeBookmark = function (account) {
            var user = securityService.loginStatus.authedUser;
            return strataService.accounts.removeBookmark(account.number, user.sso_username).then(angular.bind(this, function () {
                this.bookmarkedAccounts = this.bookmarkedAccounts.filter(function (bAcc) {
                    return bAcc.number != account.number;
                });
            }));
        };

        if (securityService.loginStatus.isLoggedIn) {
            this.init();
        }

        $rootScope.$on(AUTH_EVENTS.loginSuccess, angular.bind(this, function () {
            this.init();
        }));
    }
}
