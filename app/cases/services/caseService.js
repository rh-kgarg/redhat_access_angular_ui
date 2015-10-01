'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').constant('CASE_GROUPS', {
    manage: 'manage',
    ungrouped: 'ungrouped',
    none: 'none'
}).service('CaseService', [
    'strataService',
    'AlertService',
    'RHAUtils',
    'securityService',
    '$q',
    '$timeout',
    '$filter',
    'gettextCatalog',
    '$angularCacheFactory',
    '$rootScope',
    'CASE_EVENTS',
    'ConstantsService',
    function (strataService, AlertService, RHAUtils, securityService, $q, $timeout, $filter, gettextCatalog, $angularCacheFactory, $rootScope, CASE_EVENTS, ConstantsService) {
        $angularCacheFactory('localStorageCache', {
            storageMode: 'localStorage',
            verifyIntegrity: true
        });
        this.updatingCase = false;
        this.submittingCase = false;
        this.kase = {};
        this.prestineKase = {};
        this.caseDataReady = false;
        this.isCommentPublic = true;
        this.versions = [];
        this.products = [];
        this.severities = [];
        this.groups = [];
        this.users = [];
        this.comments = [];
        this.originalNotifiedUsers = [];
        this.updatedNotifiedUsers = [];
        this.account = {};
        this.draftComment = {};
        this.draftCommentOnServerExists=false;
        this.commentText = '';
        this.escalationCommentText = '';
        this.status = '';
        this.severity = '';
        this.type = '';
        this.group = '';
        this.owner = '';
        this.product = '';
        this.bugzillaList = {};
        this.entitlement = '';
        this.updatingNewCaseSummary = false;
        this.updatingNewCaseDescription = false;
        // Added common modal variables for Status/Severity/CaseClose confirmation
        this.confirmationModal = '';
        this.confirmationModalHeader = '';
        this.confirmationModalMessage = '';
        this.confirmationModalProperty = '';
        this.onFilterSelectChanged = function(){
            if(this.localStorageCache) {
                this.localStorageCache.put('filterSelect'+securityService.loginStatus.authedUser.sso_username,this.filterSelect);
            }
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.onSelectChanged = function(){
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.onOwnerSelectChanged = function(){
            $rootScope.$broadcast(CASE_EVENTS.ownerChange);
        };
        this.onGroupSelectChanged = function(){
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.onProductSelectChange = function(){
            $rootScope.$broadcast(CASE_EVENTS.productSelectChange);
        };
        this.groupOptions = [];
        this.showsearchoptions = false;
        this.disableAddComment = true;
        this.fts = false;
        this.fts_contact = '';
        this.draftSaved = false;
        this.sortBy='lastModifiedDate';
        this.sortOrder='desc';
        this.filterSelect = '';
        this.problemString = gettextCatalog.getString('What problem/issue/behavior are you having trouble with?  What do you expect to see?');
        this.environmentString = gettextCatalog.getString('Where are you experiencing the behavior?  What environment?');
        this.occuranceString = gettextCatalog.getString('When does the behavior occur? Frequently?  Repeatedly?   At certain times?');
        this.urgencyString = gettextCatalog.getString('What information can you provide around timeframes and urgency?');
        this.localStorageCache = $angularCacheFactory.get('localStorageCache');
        /**
         * Add the necessary wrapper objects needed to properly display the data.
         *
         * @param rawCase
         */
        this.defineCase = function (rawCase) {
            /*jshint camelcase: false */
            rawCase.severity = { 'name': rawCase.severity };
            rawCase.status = { 'name': rawCase.status };
            rawCase.group = { 'number': rawCase.folder_number };
            rawCase.type = { 'name': rawCase.type };
            this.kase = rawCase;
            this.ungroupedCaseModifier();
            angular.copy(this.kase, this.prestineKase);
            this.bugzillaList = rawCase.bugzillas;
            this.caseDataReady = true;
            this.onProductSelectChange();
        };
        this.resetCase = function(){
            angular.copy(this.prestineKase, this.kase);
        };
        this.setCase = function (jsonCase) {
            this.kase = jsonCase;
            this.ungroupedCaseModifier();
            angular.copy(this.kase, this.prestineKase);
            this.bugzillaList = jsonCase.bugzillas;
            this.caseDataReady = true;
        };

        //Explicitly assigning group_number = '-1' for ungrouped case when case payload has no group information
        this.ungroupedCaseModifier = function() {
            if(RHAUtils.isEmpty(this.kase.group.number)) {
                this.kase.group = {"number":"-1","name":"Ungrouped Case","is_private":false,"is_default":false};
            }
        };

        this.defineAccount = function (account) {
            this.account = account;
        };
        this.defineNotifiedUsers = function () {
            /*jshint camelcase: false */
            this.updatedNotifiedUsers.push(this.kase.contact_sso_username);
            //hide the X button for the case owner
            $('#rha-emailnotifyselect').on('change', angular.bind(this, function () {
                $('rha-emailnotifyselect .chosen-choices li:contains("' + this.kase.contact_sso_username + '") a').css('display', 'none');
                $('rha-emailnotifyselect .chosen-choices li:contains("' + this.kase.contact_sso_username + '")').css('padding-left', '5px');
            }));
            if (RHAUtils.isNotEmpty(this.kase.notified_users)) {
                angular.forEach(this.kase.notified_users.link, angular.bind(this, function (user) {
                    this.originalNotifiedUsers.push(user.sso_username);
                }));
                this.updatedNotifiedUsers = this.updatedNotifiedUsers.concat(this.originalNotifiedUsers);
            }
        };
        this.getGroups = function () {
            return this.groups;
        };
        this.clearCase = function () {
            this.caseDataReady = false;
            this.isCommentPublic = true;
            this.updatingCase = false;
            this.kase = {};
            this.prestineKase = {};
            this.versions = [];
            this.products = [];
            this.statuses = [];
            this.severities = [];
            this.groups = [];
            this.account = {};
            this.comments = [];
            this.bugzillaList = {};
            this.draftComment = undefined;
            this.draftCommentLocalStorage = undefined;
            this.commentText = undefined;
            this.escalationCommentText = undefined;
            this.status = undefined;
            this.severity = undefined;
            this.type = undefined;
            this.group = '';
            this.owner = undefined;
            this.product = undefined;
            this.originalNotifiedUsers = [];
            this.updatedNotifiedUsers = [];
            this.groupOptions = [];
            this.fts = false;
            this.fts_contact = '';
            this.entitlement = '';
            this.updatingNewCaseSummary = false;
            this.updatingNewCaseDescription = false;
        };
        this.groupsLoading = false;
        this.populateGroups = function (ssoUsername, flushCache) {
            var that = this;
            var deferred = $q.defer();
            this.groupsLoading = true;
            var username = ssoUsername;
            if(username === undefined){
                username = securityService.loginStatus.authedUser.sso_username;
            }
            strataService.groups.list(username, flushCache).then(angular.bind(this, function (groups) {
                that.groups = groups;
                if (that.groups.length > 0) {
                    that.group = '';
                }
                that.buildGroupOptions(that);
                that.groupsLoading = false;
                deferred.resolve(groups);
            }), angular.bind(this, function (error) {
                that.groupsLoading = false;
                AlertService.addStrataErrorMessage(error);
                deferred.reject();
            }));
            return deferred.promise;
        };
        this.usersLoading = false;
        /**
         *  Intended to be called only after user is logged in and has account details
         *  See securityService.
         */
        this.populateUsers = angular.bind(this, function () {
            var promise = null;
            if (securityService.loginStatus.authedUser.org_admin) {
                this.usersLoading = true;
                var accountNumber;
                if (this.kase.account_number) {
                    accountNumber = this.kase.account_number;
                } else {
                    accountNumber = RHAUtils.isEmpty(this.account.number) ? securityService.loginStatus.authedUser.account_number : this.account.number;
                }
                if (RHAUtils.isNotEmpty(accountNumber)){
                    promise = strataService.accounts.users(accountNumber);
                    this.owner = undefined;
                    promise.then(angular.bind(this, function (users) {
                        angular.forEach(users, function(user){
                            if(user.sso_username === securityService.loginStatus.authedUser.sso_username) {
                                this.owner = user.sso_username;
                            }
                        }, this);
                        this.usersLoading = false;
                        this.users = users;

                    }), angular.bind(this, function (error) {
                        this.users = [];
                        this.usersLoading = false;
                        AlertService.addStrataErrorMessage(error);
                    }));
                } else{
                    var deferred = $q.defer();
                    promise = deferred.promise;
                    deferred.resolve();
                }
            } else {
                deferred = $q.defer();
                promise = deferred.promise;
                deferred.resolve();
                var tmp= {'sso_username': securityService.loginStatus.authedUser.sso_username};
                this.users.push(tmp);
            }
            return promise;
        });

        this.scrollToComment = function(commentID) {
            if (!commentID) {
                return;
            }
            var commentElem = document.getElementById(commentID);
            if (commentElem) {
                commentElem.scrollIntoView(true);
            }
        };
        this.populateComments = function (caseNumber) {
            var promise = strataService.cases.comments.get(caseNumber);
            var draftId;
            promise.then(angular.bind(this, function (comments) {
                angular.forEach(comments, angular.bind(this, function (comment, index) {
                    if (comment.draft === true) {
                        this.draftComment = comment;
                        this.draftCommentOnServerExists=true;
                        draftId=this.draftComment.id;
                        this.commentText = comment.text;
                        this.isCommentPublic = comment.public;
                        if (RHAUtils.isNotEmpty(this.commentText)) {
                            this.disableAddComment = false;
                        } else if (RHAUtils.isEmpty(this.commentText)) {
                            this.disableAddComment = true;
                        }
                        comments.slice(index, index + 1);
                    }
                }));
                if(this.localStorageCache) {
                    var cacheKey = (caseNumber + securityService.loginStatus.authedUser.sso_username);
                    var fromCache = this.localStorageCache.get(cacheKey);
                    if (fromCache) {
                        this.draftComment = fromCache;
                        this.commentText = this.draftComment.text;
                        this.isCommentPublic = this.draftComment['public'];
                        if (this.draftCommentOnServerExists) {
                            this.draftComment.id = draftId;
                        }
                        if (RHAUtils.isNotEmpty(this.commentText)) {
                            this.disableAddComment = false;
                        } else if (RHAUtils.isEmpty(this.commentText)) {
                            this.disableAddComment = true;
                        }
                    }
                }
                this.comments = comments;
            }), function (error) {
            });
            return promise;
        };
        this.entitlementsLoading = false;
        this.populateEntitlements = function (ssoUserName) {
            this.entitlementsLoading = true;
            strataService.entitlements.get(false, ssoUserName).then(angular.bind(this, function (entitlementsResponse) {
                // if the user has any premium or standard level entitlement, then allow them
                // to select it, regardless of the product.
                // TODO: strata should respond with a filtered list given a product.
                //       Adding the query param ?product=$PRODUCT does not work.
                var uniqueEntitlements = function (entitlements) {
                    var uEntitlements = [];
                    entitlements.forEach(function (e) {
                        if (uEntitlements.indexOf(e.sla) < 0) {
                            uEntitlements.push(e.sla);
                        }
                    });
                    return uEntitlements;
                };
                var entitlements = uniqueEntitlements(entitlementsResponse.entitlement);
                var unknownIndex = entitlements.indexOf('UNKNOWN');
                if (unknownIndex > -1) {
                    entitlements.splice(unknownIndex, 1);
                }
                this.entitlements = entitlements;                
                
                //Added this for PCM 996
                //If the customer has only one SLA , make it selected by default on create case page
                if(RHAUtils.isNotEmpty(this.entitlements) && this.entitlements.length === 1){
                	this.entitlement = this.entitlements[0];
                }
                
                this.entitlementsLoading = false;
            }), angular.bind(this, function (error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };


        this.onChangeFTSCheck = function () {
            var showFts = this.showFts();
            this.fts = showFts;
            this.kase.fts = showFts;
        };


        this.showFts = function () {
            var showFtsCheckbox = false;
            if (RHAUtils.isNotEmpty(this.severities)) {
                if (this.entitlements !== undefined && this.entitlements.length === 1) {
                    if (this.entitlements[0] === 'PREMIUM' || this.entitlements[0] === 'AMC') {
                        showFtsCheckbox = true;
                    }
                } else if (this.entitlement === 'PREMIUM' || this.entitlement === 'AMC') {
                    showFtsCheckbox = true;
                } else if (RHAUtils.isNotEmpty(this.kase.entitlement) && (this.kase.entitlement.sla === 'PREMIUM' || this.kase.entitlement.sla === 'AMC')) {
                    showFtsCheckbox = true;
                }
                if ((showFtsCheckbox === true) && (RHAUtils.isNotEmpty(this.kase.severity) && this.kase.severity.name.charAt(0) === '1')) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        };
        this.newCaseIncomplete = true;
        this.validateNewCase = function () {
            if (RHAUtils.isEmpty(this.kase.product) || RHAUtils.isEmpty(this.kase.version) || RHAUtils.isEmpty(this.kase.summary) || RHAUtils.isEmpty(this.kase.description)) {
                this.newCaseIncomplete = true;
            } else {
                this.newCaseIncomplete = false;
            }
        };

        this.buildGroupOptions = function() {
            this.groupOptions = [];
            var sep = '────────────────────────────────────────';
            this.groups.sort(function(a, b){
                if(a.name < b.name) { return -1; }
                if(a.name > b.name) { return 1; }
                return 0;
            });

            if (this.showsearchoptions === true) {
                this.groupOptions.push({
                    value: '',
                    label: gettextCatalog.getString('All Groups')
                }, {
                    value: 'ungrouped',
                    label: gettextCatalog.getString('Ungrouped Cases')
                });
            } else {
                this.groupOptions.push({
                    value: '',
                    label: gettextCatalog.getString('Ungrouped Case')
                });
            }
            if (this.showsearchoptions === true && this.groups.length > 0) {
                this.groupOptions.push({
                    isDisabled: true,
                    label: sep
                });
            }
            angular.forEach(this.groups, function(group){
                if (group.number !== '-1') {
                    this.groupOptions.push({
                        value: group.number,
                        label: group.name
                    });
                    if (group.is_default) {
                        this.kase.group = group.number;
                        this.group = group.number;
                    }
                }
            }, this);
            if (this.showsearchoptions === true) {
                this.groupOptions.push({
                    isDisabled: true,
                    label: sep
                }, {
                    value: 'manage',
                    label: gettextCatalog.getString('Manage Case Groups')
                });
            }
        };

        this.clearLocalStorageCacheForNewCase = function(){
            if(this.localStorageCache && RHAUtils.isNotEmpty(this.localStorageCache.get(securityService.loginStatus.authedUser.sso_username))) {
                this.localStorageCache.remove(securityService.loginStatus.authedUser.sso_username);
            }
        };

        this.createCase = function(){
            var self = this;
            var deferred = $q.defer();

            /*jshint camelcase: false */
            var caseJSON = {
                'product': this.kase.product,
                'version': this.kase.version,
                'summary': this.kase.summary,
                'description': this.kase.description,
                'severity': this.kase.severity.name
            };
            if (RHAUtils.isNotEmpty(this.group)) {
                caseJSON.folderNumber = this.group;
            }
            if (RHAUtils.isNotEmpty(this.entitlement)) {
                caseJSON.entitlement = {};
                caseJSON.entitlement.sla = this.entitlement;
            }
            if (RHAUtils.isNotEmpty(this.account)) {
                caseJSON.accountNumber = this.account.number;
            }
            if (this.fts) {
                caseJSON.fts = true;
                if (this.fts_contact) {
                    caseJSON.contactInfo24X7 = this.fts_contact;
                }
            }
            if (RHAUtils.isNotEmpty(this.owner)) {
                caseJSON.contactSsoUsername = this.owner;
            }

            this.submittingCase = true;
            AlertService.addWarningMessage(gettextCatalog.getString('Creating case...'));
            strataService.cases.post(caseJSON).then(function (caseNumber) {
                AlertService.clearAlerts();
                AlertService.addSuccessMessage(gettextCatalog.getString('Successfully created case number {{caseNumber}}',{caseNumber:caseNumber}));
                self.clearLocalStorageCacheForNewCase();
                deferred.resolve(caseNumber);
            }, function (error) {
                AlertService.clearAlerts();
                AlertService.addStrataErrorMessage(error);
                self.submittingCase = false;
                deferred.reject();
            });
            return deferred.promise;
        };

        this.updateCase = function(){
            this.updatingCase = true;
            var deferred = $q.defer();
            var caseJSON = {};
            if (this.kase.type !== undefined && !angular.equals(this.prestineKase.type, this.kase.type)) {
                caseJSON.type = this.kase.type.name;
            }
            if (this.kase.severity !== undefined && !angular.equals(this.prestineKase.severity, this.kase.severity)) {
                caseJSON.severity = this.kase.severity.name;
            }
            if (this.kase.status !== undefined && !angular.equals(this.prestineKase.status, this.kase.status)) {
                caseJSON.status = this.kase.status.name;
            }
            if (this.kase.alternate_id !== undefined && !angular.equals(this.prestineKase.alternate_id, this.kase.alternate_id)) {
                caseJSON.alternateId = this.kase.alternate_id;
            }
            if (this.kase.product !== undefined && !angular.equals(this.prestineKase.product, this.kase.product)) {
                caseJSON.product = this.kase.product;
            }
            if (this.kase.version !== undefined && !angular.equals(this.prestineKase.version, this.kase.version)) {
                caseJSON.product = this.kase.product;
                caseJSON.version = this.kase.version;
            }
            if (RHAUtils.isNotEmpty(this.kase.group) && this.kase.group.number !== undefined && !angular.equals(this.prestineKase.group, this.kase.group)) {
                caseJSON.folderNumber = this.kase.group.number;
            } else if (!angular.equals(this.prestineKase.group, this.kase.group)){
                caseJSON.folderNumber = '';
            }
            if (RHAUtils.isNotEmpty(this.kase.fts) && !angular.equals(this.prestineKase.fts, this.kase.fts)) {
                caseJSON.fts = this.kase.fts;
            }
            if (this.kase.fts && !angular.equals(this.prestineKase.contact_info24_x7, this.kase.contact_info24_x7)) {
                caseJSON.contactInfo24X7 = this.kase.contact_info24_x7;
            }
            if (this.kase.notes !== null && !angular.equals(this.prestineKase.notes, this.kase.notes)) {
                caseJSON.notes = this.kase.notes;
            }
            if (this.kase.action_plan !== null && !angular.equals(this.prestineKase.action_plan, this.kase.action_plan)) {
                caseJSON.actionPlan = this.kase.action_plan;
            }
            if (this.kase.summary !== null && !angular.equals(this.prestineKase.summary, this.kase.summary) ) {
                caseJSON.summary = this.kase.summary;
            }
            strataService.cases.put(this.kase.case_number, caseJSON).then(angular.bind(this, function () {
                this.updatingCase = false;
                angular.copy(this.kase, this.prestineKase);
                deferred.resolve();
            }), function (error) {
                deferred.reject(error);
                this.updatingCase = false;
            });
            return deferred.promise;
        };
        this.updateLocalStorageForNewCase = function() {
            //as we have common component for product and version, adding extra condition for confirming its on new case
            if (this.localStorageCache && RHAUtils.isEmpty(this.kase.case_number)) {
                var draftNewCase = {};
                if (RHAUtils.isNotEmpty(this.kase.description)) {
                    draftNewCase.description = this.kase.description;
                }
                if (RHAUtils.isNotEmpty(this.kase.problem)) {
                    draftNewCase.problem = this.kase.problem;
                }
                if (RHAUtils.isNotEmpty(this.kase.environment)) {
                    draftNewCase.environment = this.kase.environment;
                }
                if (RHAUtils.isNotEmpty(this.kase.occurance)) {
                    draftNewCase.occurance = this.kase.occurance;
                }
                if (RHAUtils.isNotEmpty(this.kase.urgency)) {
                    draftNewCase.urgency = this.kase.urgency;
                }
                if (RHAUtils.isNotEmpty(this.kase.summary)) {
                    draftNewCase.summary = this.kase.summary;
                }
                if (RHAUtils.isNotEmpty(this.kase.product)) {
                    draftNewCase.product = this.kase.product;
                }
                if (RHAUtils.isNotEmpty(this.kase.version)) {
                    draftNewCase.version = this.kase.version;
                }
                var newCaseDescLocalStorage = {'text': draftNewCase};
                this.localStorageCache.put(securityService.loginStatus.authedUser.sso_username,newCaseDescLocalStorage);
            }
        };
        this.clearProdVersionFromLS = function(){
            this.kase.product = undefined;
            this.kase.version = undefined;
            this.updateLocalStorageForNewCase();
        };
        this.checkForCaseStatusToggleOnAttachOrComment = function(){
            var status = {};
            if (!securityService.loginStatus.authedUser.is_internal && this.kase.status.name === 'Closed') {
                status = { name: 'Waiting on Red Hat' };
                this.kase.status = status;
            }

            if(securityService.loginStatus.authedUser.is_internal){
                if (this.kase.status.name === 'Waiting on Red Hat') {
                    status = { name: 'Waiting on Customer' };
                    this.kase.status = status;
                }
            }else {
                if (this.kase.status.name === 'Waiting on Customer') {
                    status = { name: 'Waiting on Red Hat' };
                    this.kase.status = status;
                }
            }
        };
        this.setFilterSelectModel = function(sortField,sortOrder) {
            if(sortOrder === 'ASC') {
                if(sortField === 'lastModifiedDate') {
                    this.filterSelect = ConstantsService.sortByParams[1];
                } else if(sortField === 'severity') {
                    this.filterSelect = ConstantsService.sortByParams[2];
                } else if(sortField === 'createdDate') {
                    this.filterSelect = ConstantsService.sortByParams[5];
                } else if(sortField === 'owner') {
                    this.filterSelect = ConstantsService.sortByParams[6];
                } else if(sortField === 'status') {
                    this.filterSelect = ConstantsService.sortByParams[8];
                }
            } else if(sortOrder === 'DESC') {
                if(sortField === 'lastModifiedDate') {
                    this.filterSelect = ConstantsService.sortByParams[0];
                } else if(sortField === 'severity') {
                    this.filterSelect = ConstantsService.sortByParams[3];
                } else if(sortField === 'createdDate') {
                    this.filterSelect = ConstantsService.sortByParams[4];
                } else if(sortField === 'owner') {
                    this.filterSelect = ConstantsService.sortByParams[7];
                } else if(sortField === 'status') {
                    this.filterSelect = ConstantsService.sortByParams[9];
                }
            }
        };
    }
]);
