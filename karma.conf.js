'use strict';
// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'bower_components/jsUri/Uri.min.js',
            'bower_components/jquery/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/angular-gettext/dist/angular-gettext.min.js',
            'bower_components/angular-chosen-localytics/chosen.js',
            'bower_components/chosen/chosen.jquery.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/stratajs/strata.js',
            'bower_components/udsjs/uds.js',
            'bower_components/ng-table/ng-table.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-cache/dist/angular-cache.js',
            'bower_components/angular-treeview/angular.treeview.min.js',
            'bower_components/sinon/lib/sinon.js',
            'bower_components/sinon/lib/sinon/spy.js',
            'bower_components/sinon/lib/sinon/call.js',
            //'bower_components/sinon/lib/sinon/behavior.js',
            'bower_components/sinon/lib/sinon/stub.js',
            'bower_components/sinon/lib/sinon/mock.js',
            'bower_components/sinon/lib/sinon/collection.js',
            'bower_components/sinon/lib/sinon/assert.js',
            'bower_components/sinon/lib/sinon/sandbox.js',
            'bower_components/sinon/lib/sinon/test.js',
            'bower_components/sinon/lib/sinon/test_case.js',
            'bower_components/sinon/lib/sinon/assert.js',
            'bower_components/sinon/lib/sinon/match.js',
            'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'bower_components/moment/moment.js',
            'bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
            '.tmp/templates/RedhatAccess.template.js',
            'bower_components/redhat-access-angular-ui-common/dist/redhat_access_angular_ui_common.js',
            'app/**/*.module.js', //define all modules first!
            'app/search/**/*.js',
            'app/cases/**/*.js',
            'app/log_viewer/*.js',
            'test/mocks/**/*.js',
            'test/spec/**/*.js'
            //'app/**/*.html'

        ],

        // ngHtml2JsPreprocessor: {
        //     // strip app from the file path
        //     stripPrefix: 'app/'
        // },

        // preprocessors: {
        //     'app/**/*.html': 'html2js'
        // },
        // generate js files from html templates
        preprocessors: {
            'app/cases/**/*.js': ['coverage'],
            // 'app/ascension/**/*.js': ['coverage']
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'lcov',
            dir: 'test/coverage'
        },

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};
