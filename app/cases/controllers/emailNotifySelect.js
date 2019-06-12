'use strict';

import _ from 'lodash';

export default class EmailNotifySelect {
    constructor($scope, CaseService, securityService, AlertService, strataService, CASE_EVENTS, $filter, RHAUtils, EDIT_CASE_CONFIG, gettextCatalog) {
        'ngInject';

        $scope.CaseService = CaseService;
        $scope.securityService = securityService;
        $scope.showEmailNotifications = EDIT_CASE_CONFIG.showEmailNotifications;
        $scope.selectedUsers = [];
        $scope.saving = false;
        $scope.usersOnAccount = [];
        $scope.RHAUtils = RHAUtils;

        $scope.selectedUsersChanged = () => {
            const previouslySelectedUsers = _.intersection(CaseService.originalNotifiedUsers, _.map($scope.usersOnAccount, 'sso_username'));
            // ignore the case contact, we never want to add/remove notifications for him
            const toBeAdded = _.without(_.difference($scope.selectedUsers, previouslySelectedUsers), CaseService.kase.contact_sso_username);
            const toBeRemoved = _.without(_.difference(previouslySelectedUsers, $scope.selectedUsers), CaseService.kase.contact_sso_username);

            $scope.saving = true;

            function submitWatchers(toBeAdded, toBeRemoved, removed) {
                const addPromises = _.map(toBeAdded, (user) => strataService.cases.notified_users.add(CaseService.kase.case_number, user));
                const removePromises = _.map(toBeRemoved, (user) => strataService.cases.notified_users.remove(CaseService.kase.case_number, user));

                return Promise.all([...addPromises, ...removePromises]).then(() => {
                    _.pullAll(CaseService.originalNotifiedUsers, toBeRemoved);
                    CaseService.originalNotifiedUsers = CaseService.originalNotifiedUsers.concat(toBeAdded);
                    $scope.saving = false;

                    // add warning message for users we cannot add
                    _.each(removed, (sso)=> AlertService.addWarningMessage(gettextCatalog.getString('User {{sso}} cannot be added as watcher because it is not internal.', {sso})));
                });
            }
            return submitWatchers(toBeAdded, toBeRemoved, []);
        };


        $scope.mapUsers = (users) => _.compact(_.map(users, (userSSO) => _.find(CaseService.users, {'sso_username': userSSO})));

        $scope.isCurrentUserWatcher = () => $scope.selectedUsers.indexOf(securityService.loginStatus.authedUser.sso_username) > -1;
        $scope.isCurrentUserCaseContact = () => CaseService.kase.contact_sso_username == securityService.loginStatus.authedUser.sso_username;
        $scope.isCurrentUserNotifiedUser = () => _.includes(CaseService.originalNotifiedUsers, securityService.loginStatus.authedUser.sso_username);

        $scope.toggleCurrentUser = () => {
            if($scope.isCurrentUserWatcher()) {
                _.pull($scope.selectedUsers, securityService.loginStatus.authedUser.sso_username);
                $scope.selectedUsersChanged();
            } else {
                $scope.selectedUsers.push(securityService.loginStatus.authedUser.sso_username);
                $scope.selectedUsersChanged();
            }
        };

        const init = () => {
            function setUsers() {
                if(securityService.loginStatus.authedUser.org_admin || securityService.loginStatus.authedUser.is_internal) {
                    $scope.usersOnAccount = _.cloneDeep(CaseService.users);
                    if(securityService.loginStatus.authedUser.accountContacts && securityService.loginStatus.authedUser.accountContacts.length > 0) {
                        $scope.usersOnAccount = $scope.usersOnAccount.concat(securityService.loginStatus.authedUser.accountContacts);
                    }
                    if(CaseService.internalNotificationContacts.length>0) {
                        const strataInternalNotificationContacts = _.map(CaseService.internalNotificationContacts,(c)=> {
                            return {
                                first_name: c.firstName,
                                last_name: c.lastName,
                                org_admin: c.isOrgAdmin,
                                sso_username: c.ssoUsername,
                                is_internal: c.isInternal
                            }
                        })
                        $scope.usersOnAccount = $scope.usersOnAccount.concat(strataInternalNotificationContacts);
                    }
                    $scope.usersOnAccount = _.uniqBy($scope.usersOnAccount,'sso_username');
                } else {
                    $scope.usersOnAccount = _.cloneDeep(CaseService.users);
                }
                $scope.selectedUsers =  _.intersection(_.map($scope.usersOnAccount, 'sso_username'), CaseService.originalNotifiedUsers);
                $scope.selectedUsers.unshift(CaseService.kase.contact_sso_username); // fake insert the Case Contact
            }
            CaseService.getCustomNotificationEmails();
            CaseService.populateUsers();
            $scope.$watch('CaseService.users', () => setUsers());
            $scope.$watch('CaseService.originalNotifiedUsers', () => setUsers());
            $scope.$watch('securityService.loginStatus.authedUser.accountContacts', () => setUsers());
            $scope.$watch('CaseService.kase.contact_sso_username', () => setUsers());
            securityService.loginStatus.authedUser.is_internal && $scope.$watch('CaseService.internalNotificationContacts', () => setUsers());
        };

        if (CaseService.caseDataReady) {
            init();
        }
        $scope.$on(CASE_EVENTS.received, () => {
            init();
        });
    }
}
