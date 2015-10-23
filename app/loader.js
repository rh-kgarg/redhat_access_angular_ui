/*global document, window, angular*/
(function() {
  window.chrometwo_require([
    'angular128',
    'jquery'
  ], function(angular, jq) {
    'use strict';
    window.require.undef('moment');
    window.require.config({
      paths: {
        'strata': '/bower_components/stratajs/strata',
        'uds': '/bower_components/udsjs/uds',
        'moment': '/bower_components/moment/moment'
      },
      map: {
        '*': {
          'angular': 'angular128'
        }
      }
    });

    window.chrometwo_require(['strata','uds','moment'], function(strata,uds,moment) {
      // export strata and uds
      window.strata = strata;
      window.uds = uds;
      window.moment=moment;
    });

    // keep track of deferreds we are loading
    var dfds = [];
    var qLoad = function(mod, index) {
      var previousDfd = dfds[index - 1];
      dfds[index] = new jq.Deferred();
      // Internal load that actually wraps the chrometwo_require
      var _load = function() {
        window.chrometwo_require(mod.split(), function() {
          // All good, resolve deferred
          dfds[index].resolve();
        });
      };
      if (previousDfd) {
        // We have a previous mod loading, chain the next load
        previousDfd.always(_load);
      } else {
        // First module being loaded. Fire away
        _load();
      }
      return dfds[index].promise();
    };
    // Queue up loading of modules
    for (var i = 0; i < window.deps.length; i++) {
      qLoad(window.deps[i], i);
    }
    // Once all modules have loaded bootstrap it
    jq.when.apply(jq, dfds).always(function() {
      breadcrumbs = [
      ['Support', '/support/'],
      ['Support Cases',  '/support/cases/']
      ];
      var host = window.location.host;
      strata.setStrataHostname('https://' + host);
      $.support.cors = true;
      angular.module('RedhatAccess.cases').config(['$urlRouterProvider',
            function($urlRouterProvider) {
              $urlRouterProvider.otherwise('case/list')
            }
            ]).run([
                '$rootScope',
                'COMMON_CONFIG',
                'CHAT_SUPPORT',
                'EDIT_CASE_CONFIG',
                'NEW_CASE_CONFIG',
                'SECURITY_CONFIG',
                'AUTH_EVENTS',
                'securityService',
                'gettextCatalog',
                function ($rootScope, COMMON_CONFIG, CHAT_SUPPORT, EDIT_CASE_CONFIG, NEW_CASE_CONFIG, SECURITY_CONFIG, AUTH_EVENTS, securityService, gettextCatalog){
                  COMMON_CONFIG.showTitle = true;
                  SECURITY_CONFIG.autoCheckLogin = false;
                  SECURITY_CONFIG.displayLoginStatus = false;
                  NEW_CASE_CONFIG.showServerSideAttachments = false;
                  EDIT_CASE_CONFIG.showServerSideAttachments = false;
                  gettextCatalog.currentLanguage = getCookieValue('rh_locale');
                  CHAT_SUPPORT.enableChat = true;
                  NEW_CASE_CONFIG.isPCM = true;
                  NEW_CASE_CONFIG.productSortListFile = 'productSortList.txt';
                  EDIT_CASE_CONFIG.isPCM = true;
                  COMMON_CONFIG.isGS4 = true;
                  if (host !== 'access.redhat.com' ) {
                    CHAT_SUPPORT.chatButtonToken = '573A0000000GmiP';
                    CHAT_SUPPORT.chatLiveAgentUrlPrefix = 'https://d.la6cs.salesforceliveagent.com/chat';
                    CHAT_SUPPORT.chatInitHashOne = '572A0000000GmiP';
                    CHAT_SUPPORT.chatInitHashTwo = '00DJ0000003OR6V';
                    CHAT_SUPPORT.chatIframeHackUrlPrefix = 'https://qa-rogsstest.cs10.force.com/chatHidden';
                  }
                  securityService.validateLogin(false).then(function (authedUser) {
                    var account = securityService.loginStatus.account;
                    if(account !== undefined && account.is_secured_support !== undefined && account.is_secured_support === true){
                      strata.setRedhatClientID("secure_case_management_1.0");
                      strata.setStrataHostname('https://' + host.replace('access.', 'access.us.'));
                      NEW_CASE_CONFIG.showRecommendations = false;
                      NEW_CASE_CONFIG.showAttachments = false;
                      EDIT_CASE_CONFIG.showBugzillas = false;
                      EDIT_CASE_CONFIG.showAttachments = false;
                      EDIT_CASE_CONFIG.showRecommendations = false;
                      EDIT_CASE_CONFIG.showEmailNotifications = false;
                      CHAT_SUPPORT.enableChat = false;
                      COMMON_CONFIG.isGS4 = true;
                      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    }
                  }, function (error) {
                        window.location.replace(redirectURL);
                  });
                }
              ])
          .factory('$exceptionHandler', function() {
              if (host !== 'access.redhat.com') {
                  return function (exception, cause) {
                      exception.message += ' (caused by "' + cause + '")';
                      throw exception;
                  };
              }
        });
      // Bootstrap angular app
      angular.bootstrap(document, ['RedhatAccess']);
      // Fade in main element
      jq('#pcm').fadeIn();
    });

  });
})();
