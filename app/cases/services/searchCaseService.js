/*jshint camelcase: false*/
'use strict';
angular.module('RedhatAccess.cases').service('SearchCaseService', [
    'CaseService',
    'strataService',
    'AlertService',
    'STATUS',
    'CASE_GROUPS',
    'AUTH_EVENTS',
    '$q',
    '$rootScope',
    'SearchBoxService',
    'securityService',
    'COMMON_CONFIG',
    'RHAUtils',
    function (CaseService, strataService, AlertService, STATUS, CASE_GROUPS, AUTH_EVENTS, $q, $rootScope, SearchBoxService, securityService, COMMON_CONFIG, RHAUtils) {
        this.cases = [];
        this.totalCases = 0;
        this.searching = true;
        this.start = 0;
        this.count = 50;
        this.total = 0;
        this.allCasesDownloaded = false;
        this.refreshFilterCache=false;
        this.caseListPage = 1;
        this.caseListPageSize = 10;
        this.caseParameters = {
            searchTerm: '',
            status: STATUS.open,
            group: ''
        };
        this.gs4Accounts = [
            "639769",
            "660699"
        ];
        this.gs4Account = this.gs4Accounts[0];
        this.previousGroupFilter = CASE_GROUPS.none;
        var getIncludeClosed = function (caseParameters) {
            if (caseParameters.status === STATUS.open) {
                return false;
            } else if (caseParameters.status === STATUS.closed) {
                return true;
            } else if (caseParameters.status === STATUS.both) {
                return true;
            }
            return true;
        };
        this.clear = function () {
            this.cases = [];
            this.oldQueryString = '';
            SearchBoxService.searchTerm = '';
            this.start = 0;
            this.total = 0;
            this.totalCases = 0;
            this.allCasesDownloaded = false;
            this.searching = true;
        };
        this.clearPagination = function () {
            this.start = 0;
            this.total = 0;
            this.allCasesDownloaded = false;
            this.cases = [];
        };
        this.oldQueryString = '';
        var queryString = '';

        this.doFilter = function (checkIsInternal) {
            this.previousGroupFilter = this.caseParameters.group;
            queryString = '';

            //TODO add internal and GS4
            // if(COMMON_CONFIG.isGS4 === true){
            //     params.account_number = "639769";
            // }
            var caseOwner = '';
            if (!COMMON_CONFIG.isGS4 && securityService.loginStatus.authedUser.sso_username && securityService.loginStatus.authedUser.is_internal && checkIsInternal === undefined || checkIsInternal === true) {
                caseOwner = "\"" + securityService.loginStatus.authedUser.first_name + " " + securityService.loginStatus.authedUser.last_name + "\"";
            }

            var promises = [];
            var deferred = $q.defer();
            //if (!angular.equals(queryString, this.oldQueryString)) {
            this.searching = true;
            this.oldQueryString = queryString;
            var that = this;
            var cases = null;
                //TODO add internal pallet
                // if (!COMMON_CONFIG.isGS4 && securityService.loginStatus.authedUser.sso_username && securityService.loginStatus.authedUser.is_internal && checkIsInternal === undefined || checkIsInternal === true) {
                //     params.associate_ssoname = securityService.loginStatus.authedUser.sso_username;
                //     //params.associate_ssoname = securityService.loginStatus.authedUser.sso_username;
                //     //params.view = 'internal';
                // }

            // Fetching the sort by parameter from localstorage
            if(CaseService.localStorageCache) {
                if (CaseService.localStorageCache.get('filterSelect'+securityService.loginStatus.authedUser.sso_username)) {
                    var filterSelectCache = CaseService.localStorageCache.get('filterSelect'+securityService.loginStatus.authedUser.sso_username);
                    CaseService.setFilterSelectModel(filterSelectCache.sortField,filterSelectCache.sortOrder);
                }
            }
            if(this.caseParameters.searchTerm === undefined || this.caseParameters.searchTerm === ''){
                var params = {
                    count: this.count,
                    include_closed: getIncludeClosed(this.caseParameters)
                };
                if(COMMON_CONFIG.isGS4 === true && securityService.loginStatus.authedUser.sso_username && securityService.loginStatus.authedUser.is_internal){
                    params.account_number = this.gs4Account;
                }
                params.start = this.start;

                //if (!RHAUtils.isEmpty(this.caseParameters.searchTerm)) {
                //    params.keyword = this.caseParameters.searchTerm;
                //}
                if (this.caseParameters.group === CASE_GROUPS.ungrouped || this.caseParameters.group === "-1") {
                    params.only_ungrouped = true;
                } else if (!RHAUtils.isEmpty(this.caseParameters.group)) {
                    params.group_numbers = { group_number: [this.caseParameters.group] };
                }
                if (this.caseParameters.status === STATUS.closed) {
                    params.status = STATUS.closed;
                }
                // Not doing product based searching
                // if (!RHAUtils.isEmpty(CaseService.product)) {
                //     params.product = CaseService.product;
                // }
                if (!RHAUtils.isEmpty(CaseService.filterSelect.sortField)) {
                    if(CaseService.filterSelect.sortField === 'owner'){
                        params.sort_field = 'contactName';
                    } else{
                        params.sort_field = CaseService.filterSelect.sortField;
                    }
                }
                if (!RHAUtils.isEmpty(CaseService.filterSelect.sortOrder)) {
                    //This is a hack because strata returns the severities in reverse order
                    if((CaseService.filterSelect.sortField === 'severity' || CaseService.filterSelect.sortField === 'status') && CaseService.filterSelect.sortOrder === 'ASC'){
                        params.sort_order = 'DESC';
                    } else if((CaseService.filterSelect.sortField === 'severity' || CaseService.filterSelect.sortField === 'status') && CaseService.filterSelect.sortOrder === 'DESC'){
                        params.sort_order = 'ASC';
                    } else{
                        params.sort_order = CaseService.filterSelect.sortOrder;
                    }
                }
                // if (!RHAUtils.isEmpty(CaseService.owner)) {
                //     params.owner_ssoname = CaseService.owner;
                // }
                if (!RHAUtils.isEmpty(CaseService.type)) {
                    params.type = CaseService.type;
                }
                if (!RHAUtils.isEmpty(CaseService.severity)) {
                    params.severity = CaseService.severity;
                }
                if (!COMMON_CONFIG.isGS4 && securityService.loginStatus.authedUser.sso_username && securityService.loginStatus.authedUser.is_internal && checkIsInternal === undefined || checkIsInternal === true) {
                    params.associate_ssoname = securityService.loginStatus.authedUser.sso_username;
                    params.view = 'internal';
                }
                if(this.refreshFilterCache===true)
                {
                    strataService.cache.clr('filter'+ JSON.stringify(params));
                    this.refreshFilterCache=false;
                }
                cases = strataService.cases.filter(params).then(angular.bind(that, function (response) {
                    if(response['case'] === undefined ){
                        that.totalCases = 0;
                        that.total = 0;
                        that.allCasesDownloaded = true;
                    } else {
                        that.totalCases = response.total_count;
                        if (response['case'] !== undefined && response['case'].length + that.total >= that.totalCases) {
                            that.allCasesDownloaded = true;
                        }
                        if (response['case'] !== undefined){
                            that.cases = that.cases.concat(response['case']);
                            //that.count = response['case'].length + that.total
                            that.start = that.start + that.count;
                            that.total = that.total + response['case'].length;
                        }
                    }
                    that.searching = false;
                    deferred.resolve(cases);
                }), angular.bind(that, function (error) {
                    // if(error.xhr.status === 404){
                    //     this.doFilter(false).then(function () {
                    //         deferred.resolve(cases);
                    //     });
                    //} else{
                        this.allCasesDownloaded = true;
                        AlertService.addStrataErrorMessage(error);
                        that.searching = false;
                        deferred.resolve(cases);
                    //}
                }));
            } else{
                var sortField = CaseService.filterSelect.sortField;
                if(sortField === "owner"){
                    sortField = "contactName";
                }
                cases = strataService.cases.search(this.caseParameters.status, null, this.caseParameters.group, null, this.caseParameters.searchTerm, sortField, CaseService.filterSelect.sortOrder, this.start, this.count, null, null).then(angular.bind(that, function (response) {
                    if(response['case'] === undefined){
                        that.totalCases = 0;
                        that.total = 0;
                        that.allCasesDownloaded = true;
                    } else {
                        that.totalCases = response.total_count;
                        that.cases = that.cases.concat(response['case']);
                        that.start = that.start + that.count;
                        that.total = that.total + response['case'].length;
                        if (response['case'] !== undefined && that.total >= that.totalCases) {
                            that.allCasesDownloaded = true;
                        }
                    }
                    that.searching = false;
                    deferred.resolve(cases);
                }), angular.bind(that, function (error) {
                    // if(error.xhr.status === 404){
                    //     this.doFilter(false).then(function () {
                    //         deferred.resolve(cases);
                    //     });
                    // } else{
                        this.allCasesDownloaded = true;
                        AlertService.addStrataErrorMessage(error);
                        that.searching = false;
                        deferred.resolve(cases);
                    //}
                }));
            }
            promises.push(deferred.promise);
            return $q.all(promises);
        };
    }
]);
