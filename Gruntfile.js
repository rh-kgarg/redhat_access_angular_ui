// Generated on 2014-02-17 using generator-angular 0.7.1
/*jshint camelcase: false */
'use strict';
// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
//var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};
module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-image-embed');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-angular-gettext');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-sonar-runner');
    grunt.loadNpmTasks('grunt-karma-sonar');
    // Define the configuration for all the tasks
    grunt.initConfig({
        distdir: 'dist',
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' + ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
        yeoman: {
            app: require('./bower.json').appPath || 'app',
            dist: 'dist',
            bowerDir: grunt.file.readJSON('.bowerrc').directory
        },
        src: {
            js: [
                'app/**/*.module.js',
                'app/common/**/*.js',
                'app/security/**/*.js',
                'app/search/**/*.js',
                'app/cases/**/*.js',
                'app/log_viewer/**/*.js',
                'app/ascension/**/*.js',
                'app/escalation/**/*.js'
            ],
            jsTpl: ['.tmp/templates/**/*.js'],
            specs: ['test/**/*.spec.js'],
            scenarios: ['test/**/*.scenario.js'],
            html: ['app/index.html'],
            tpl: {
                app: [
                    'app/common/**/*.html',
                    'app/security/**/*.html',
                    'app/search/**/*.html',
                    'app/cases/**/*.html',
                    'app/log_viewer/**/*.html',
                    'app/ascension/**/*.html',
                    'app/escalation/**/*.html'
                ]
            },
            css: {
                app: [
                    'app/assets/css/main.min.css'
                    // 'app/security/**/*.css',
                    // 'app/search/**/*.css',
                    // 'app/cases/**/*.css',
                    // 'app/log_viewer/**/*.css'
                ]
            },
            img: ['<%= yeoman.app %>/**/img/*'],
            thirdParty: {
                js: [
                    '<%= yeoman.bowerDir %>/js-markdown-extra/js-markdown-extra.js',
                    '<%= yeoman.bowerDir %>/jsUri/Uri.js',
                    '<%= yeoman.bowerDir %>/stratajs/strata.js',
                    '<%= yeoman.bowerDir %>/udsjs/uds.js',
                    '<%= yeoman.bowerDir %>/angular-resource/angular-resource.js',
                    '<%= yeoman.bowerDir %>/angular-sanitize/angular-sanitize.js',
                    '<%= yeoman.bowerDir %>/angular-route/angular-route.js',
                    '<%= yeoman.bowerDir %>/angular-ui-router/release/angular-ui-router.js',
                    '<%= yeoman.bowerDir %>/angular-bootstrap/ui-bootstrap-tpls.js',
                    '<%= yeoman.bowerDir %>/angular-treeview/angular.treeview.js',
                    '<%= yeoman.bowerDir %>/ng-table/ng-table.js',
                    '<%= yeoman.bowerDir %>/angular-gettext/dist/angular-gettext.min.js',
                    '<%= yeoman.bowerDir %>/angular-chosen-localytics/chosen.js',
                    '<%= yeoman.bowerDir %>/angular-cache/dist/angular-cache.js',
                    '<%= yeoman.bowerDir %>/chosen/chosen.jquery.js',
                    '<%= yeoman.bowerDir %>/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
                    '<%= yeoman.bowerDir %>/redhat-access-angular-ui-common/dist/redhat_access_angular_ui_common.js'

                ],
                css: [
                    '<%= yeoman.bowerDir %>/angular-treeview/css/angular.treeview.css',
                    '<%= yeoman.bowerDir %>/ng-table/ng-table.css',
                    '<%= yeoman.bowerDir %>/chosen/chosen.css',
                    '<%= yeoman.bowerDir %>/components-font-awesome/css/font-awesome.min.css'
                ],
                img: [
                    '<%= yeoman.bowerDir %>/angular-treeview/img/*',
                    '<%= yeoman.bowerDir %>/chosen/*.png'
                ]
            },
            i18n: {
                generated: ['<%= yeoman.app %>/i18n/translations.js']
            }
        },
        watch: {
            js: {
                files: ['<%= yeoman.app %>/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
	        sass: {
		        files: [
			        'app/assets/sass/*.scss',
			        'app/assets/sass/**/*.scss'
		        ],
		        tasks: ['sass']
	        },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: [
                    'newer:jshint:test',
                    'karma'
                ]
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: [
                    'newer:copy:styles'
                    //'autoprefixer'
                ]
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            jade: {
                files: ['<%= yeoman.app %>/**/*.jade'],
                tasks: ['newer:jade']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= src.tpl.app %>',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
					'app/assets/css/main.min.css'
				]
            }
        },
        connect: {
            options: {
                port: 9000,
                //protocol: 'https',
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.'),
                            mountFolder(connect, 'app'),
                            require('./rest-mock-server')
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>'
                }
            }
        },
        nggettext_extract: {
            options: {
                markerName: 'translate'
            },
            pot: {
                files: {
                    '<%= yeoman.app %>/i18n/template.pot': [
                        '<%= src.tpl.app %>',
                        '<%= src.js %>',
                        '<%= yeoman.app %>/i18n/placeholder.html',
                        'bower_components/redhat-access-angular-ui-common/dist/redhat_access_angular_ui_common.js'
                    ]
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    '<%= yeoman.app %>/i18n/translations.js': ['<%= yeoman.app %>/i18n/*.po']
                }
            }
        },
	    sass: {
		    dist: {
			    options: {
				    style: 'expanded',
				    compass: true,
				    require: 'breakpoint',
				    lineNumbers: true
			    },
			    files: {
				    'app/assets/css/main.min.css': [
					    'app/assets/sass/main.scss'
				    ]
			    }
		    }
	    },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                '<%= src.js %>'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            },
            files: grunt.option('files') ? grunt.option('files').split(' ') : []
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp',
            hooks: ['.git/hooks/pre-commit']
        },
        // autoprefixer: {
        //     options: {
        //         browsers: ['last 1 version']
        //     },
        //     dist: {
        //         files: [{
        //             expand: true,
        //             cwd: '.tmp/styles/',
        //             src: '{,*/}*.css',
        //             dest: '.tmp/styles/'
        //         }]
        //     }
        // },
        'bower-install': {
            app: {
                html: '<%= yeoman.app %>/index.html',
                ignorePath: '<%= yeoman.app %>/'
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '.tmp/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '.tmp',
                    src: ['{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        jade: {
            dist: {
                options: {
                    pretty: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.app %>',
                    src: '**/*.jade',
                    ext: '.html'
                }]
            }
        },
        ngAnnotate: {
            options: {},
            dist: {
                files: [{
                    src: '.tmp/<%= pkg.name %>-deps.js',
                    dest: '<%= distdir %>/js/<%= pkg.name %>-deps.js'
                }]
            },
            distNoDeps: {
                files: [{
                    src: '.tmp/<%= pkg.name %>.js',
                    dest: '<%= distdir %>/<%= pkg.name %>.js'
                }]
            }
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'bower_components/**/*',
                        'images/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                filter: 'isFile',
                flatten: true,
                dest: '.tmp/styles/',
                src: '<%= src.css.app %>'
            },
            images: {
                files: [{
                    expand: true,
                    flatten: true,
                    nonull: true,
                    src: '<%= src.img %>',
                    dest: '<%= yeoman.dist %>/img/',
                    filter: 'isFile'
                }, {
                    expand: true,
                    flatten: true,
                    nonull: true,
                    src: '<%= src.thirdParty.img %>',
                    dest: '<%= yeoman.dist %>/img/',
                    filter: 'isFile'
                }, {
                    expand: true,
                    flatten: true,
                    nonull: true,
                    src: '<%= yeoman.bowerDir%>/chosen/*.png',
                    dest: '<%= yeoman.dist %>/styles',
                    filter: 'isFile'
                }]
            }
        },
        concurrent: {
            server: ['copy:styles'],
            test: ['copy:styles'],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },
        imageEmbed: {
            dist: {
                src: ['<%= yeoman.dist %>/styles/<%= pkg.name %>-deps.css'],
                dest: '<%= yeoman.dist %>/styles/<%= pkg.name %>-deps-embedded-images.css',
                options: {
                    deleteAfterEncoding: false
                }
            },
            distNoDeps: {
                src: ['<%= yeoman.dist %>/styles/<%= pkg.name %>.css'],
                dest: '<%= yeoman.dist %>/styles/<%= pkg.name %>-embedded-images.css',
                options: {
                    deleteAfterEncoding: false
                }
            }
        },
        shell: {
            hooks: {
                command: 'cp hooks/pre-commit .git/hooks/'
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/<%= pkg.name %>-deps.css': [
                        '<%= src.thirdParty.css %>'
                    ]
                }
            },
            distNoDeps: {
                files: {
                    '<%= yeoman.dist %>/styles/<%= pkg.name %>.css': ['<%= src.css.app %>']
                }
            }
        },
        concat: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: [
                    '<%= src.thirdParty.js %>'
                ],
                dest: '.tmp/<%= pkg.name %>-deps.js',
                nonull: true
            },
            distNoDeps: {
                options: {
                    banner: '<%= banner %>'
                },
                src: [
                    '<%= src.i18n.generated %>',
                    '<%= src.js %>',
                    '<%= src.jsTpl %>'
                ],
                dest: '.tmp/<%= pkg.name %>.js',
                nonull: true
            }
        },
        html2js: {
            app: {
                options: {
                    base: 'app'
                },
                src: ['<%= src.tpl.app %>'],
                dest: '.tmp/templates/RedhatAccess.template.js',
                module: 'RedhatAccess.template'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        sonarRunner: {
            analysis: {
                options: {
                    debug: true,
                    separator: '\n',
                    sonar: {
                        host: {
                            url: 'http://jenkins.gsslab.rdu2.redhat.com:9100/sonar/'
                        },
                        jdbc: {
                            url: 'jdbc:mysql://jenkins.gsslab.rdu2.redhat.com:3306/sonar',
                            username: 'sonar',
                            password: 'sonar'
                        },
                        projectKey: 'portal:pcm:redhat_access_angular_ui',
                        projectName: 'redhat_access_angular_ui',
                        projectVersion: '<%= pkg.version %>',
                        sources: ['app'].join(','),
                        language: 'js',
                        sourceEncoding: 'UTF-8'
                    }
                }
            }
        },
        karma_sonar: {
            options: {
                instance: {
                    hostUrl: 'http://jenkins.gsslab.rdu2.redhat.com:9100/sonar/',
                    jdbcUrl: 'jdbc:mysql://jenkins.gsslab.rdu2.redhat.com:3306/sonar',
                    login: 'admin',
                    password: 'admin'
                }
            },
            your_target: {
                project: {
                    key: 'portal:pcm:redhat_access_angular_ui',
                    name: 'redhat_access_angular_ui',
                    version: '<%= pkg.version %>'
                },
                sources: [
                    {
                        path: 'app',
                        coverageReport: 'test/coverage/PhantomJS 1.9.8 (Linux)/lcov.info'
                    }
                ],
                exclusions: []
            }
        }
    });
    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run([
                'build',
                'connect:dist:keepalive'
            ]);
        }
        grunt.task.run([
            'clean:server',
            'bower-install',
            'newer:jade',
            'build',
            'concurrent:server',
            //'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });
	grunt.registerTask('dev', function (target) {
		//if (target === 'dist') {
		//	return grunt.task.run([
		//		'build',
		//		'connect:dist:keepalive'
		//	]);
		//}
		grunt.task.run([
			//'clean:server',
			//'bower-install',
			//'newer:jade',
			'build',
			//'concurrent:server',
			//'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});
    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });
    grunt.registerTask('test', [
        'html2js',
        'concurrent:test',
        //'autoprefixer',
        'connect:test',
        'karma'
    ]);
    grunt.registerTask('build', [
        'clean:dist',
        'bower-install',
        'newer:jade',
	    'sass',
	    'useminPrepare',
        'html2js',
        'concurrent:dist',
        //'autoprefixer',
        'nggettext_compile',
        'concat',
        'ngAnnotate',
        'copy:images',
        'cssmin',
        'imageEmbed',
        'htmlmin'
        //'test'
    ]);
    // Clean the .git/hooks/pre-commit file then copy in the latest version
    grunt.registerTask('inithooks', [
        'clean:hooks',
        'shell:hooks'
    ]);
    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
    grunt.registerTask('sonar', [
        'sonarRunner:analysis'
    ]);
};
