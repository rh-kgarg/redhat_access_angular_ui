'use strict';

import _ from 'lodash';
import hydrajs  from '../../shared/hydrajs';

export default class EmailNotifySelectInternal {
    constructor($scope, CaseService, securityService, AlertService, strataService, CASE_EVENTS, gettextCatalog) {
        'ngInject';
        $scope.isLoadingContacts = false;
        $scope.CaseService = CaseService;
        $scope.selectedUsers = [];
        $scope.saving = false;
        $scope.contactToAdd = undefined;
        $scope.noResults = false;

        const submitWatchers = (toBeAdded, toBeRemoved, removed) => {
            const addPromises = _.map(toBeAdded, (user) => strataService.cases.notified_users.add(CaseService.kase.case_number, user));
            const removePromises = _.map(toBeRemoved, (user) => strataService.cases.notified_users.remove(CaseService.kase.case_number, user));
            $scope.saving = true;
            return Promise.all([...addPromises, ...removePromises]).then(() => {
                _.pullAll(CaseService.originalNotifiedUsers, toBeRemoved);
                CaseService.originalNotifiedUsers = CaseService.originalNotifiedUsers.concat(toBeAdded);
                $scope.saving = false;
                // add warning message for users we cannot add
                _.each(removed, (sso)=> AlertService.addWarningMessage(gettextCatalog.getString('User {{sso}} cannot be added as watcher because it is not internal.', {sso})));
            }).catch((error) => {
                AlertService.addDangerMessage(gettextCatalog.getString('Failed to update watchers, please retry.'));
                $scope.saving = false;
            });
        }

        $scope.selectedUsersChanged = () => {
            const previouslySelectedUsers = _.intersection(CaseService.originalNotifiedUsers, _.map(CaseService.internalNotificationContacts, 'ssoUsername'));
            // ignore the case contact, we never want to add/remove notifications for him
            const toBeAdded = _.without(_.difference($scope.selectedUsers, previouslySelectedUsers), CaseService.kase.contact_sso_username);
            const toBeRemoved = _.without(_.difference(previouslySelectedUsers, $scope.selectedUsers), CaseService.kase.contact_sso_username);
            const internalSSOs = _.map(_.filter([$scope.contactToAdd], 'isInternal'), 'ssoUsername');
            // remove non-internal users
            const removed = _.remove(toBeAdded, (userSSO) => internalSSOs.indexOf(userSSO) == -1);
            return submitWatchers(toBeAdded, toBeRemoved, removed);
        };

        $scope.removeUser = (userSSO) => {
            if($scope.saving) return;

            _.pull($scope.selectedUsers, userSSO);
            $scope.selectedUsersChanged();
        };

        $scope.isCurrentUserWatcher = () => $scope.selectedUsers.indexOf(securityService.loginStatus.authedUser.sso_username) > -1;
        $scope.isCurrentUserCaseContact = () => CaseService.kase.contact_sso_username == securityService.loginStatus.authedUser.sso_username;

        $scope.toggleCurrentUser = () => {
            if($scope.isCurrentUserWatcher()) {
                _.pull($scope.selectedUsers, securityService.loginStatus.authedUser.sso_username);
                $scope.selectedUsersChanged();
            } else {
                const authedUser = securityService.loginStatus.authedUser;
                $scope.contactToAdd = {
                    ssoUsername: authedUser.sso_username,
                    firstName: authedUser.first_name,
                    lastName: authedUser.last_name,
                    isInternal: authedUser.is_internal,
                    orgAdmin: authedUser.org_admin
                }
                $scope.selectedUsers.push(authedUser.sso_username);
                $scope.selectedUsersChanged();
            }
        };

        const init = () => {
            $scope.$watch('CaseService.originalNotifiedUsers', async () => {
                await CaseService.setInternalNotificationContacts(CaseService.originalNotifiedUsers)
                $scope.selectedUsers = _.map(CaseService.internalNotificationContacts, 'ssoUsername');
            });
        };

        if (CaseService.caseDataReady) {
            init();
        }
        $scope.$on(CASE_EVENTS.received, () => {
            init();
        });

        $scope.$watch('userToAdd', (user) => {
            if(_.isObject(user)) { // user is object if it was selected from the options, otherwise it's string
                $scope.contactToAdd = user;
                $scope.selectedUsers.push(user.ssoUsername);
                $scope.selectedUsersChanged();
                $scope.userToAdd = '';
            }
        });
    }
}
