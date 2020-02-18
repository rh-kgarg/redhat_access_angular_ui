'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require("stats-webpack-plugin");
// var CopyWebpackPlugin = require('copy-webpack-plugin');
// var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var path = require('path');

// post-css doesn't like node v.10 https://github.com/postcss/postcss-nested/issues/30  Need to polyfill here just for
// the build
require('es6-promise').polyfill();

var resolveBowerPath = function (componentPath) {
    return path.join(__dirname, 'bower_components', componentPath);
};


module.exports = function (options) {

    /**
     * Env
     * Get npm lifecycle event to identify the environment
     */
    var ENV = options.env || process.env.npm_lifecycle_event;
    var isTest = ENV === 'test' || ENV === 'test-watch';
    var isProd = (ENV === 'prod' || ENV == 'server-prod');

    console.log("Environment: " + ENV + ", isProd: " + isProd);

    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    var config = {};

    // When we're running the test build we need to mock some node environment configs
    config.node = ENV == 'TEST' ? { fs: 'empty' } : {};

    config.context = __dirname + '/app';

    /**
     * Entry
     * Reference: http://webpack.github.io/docs/configuration.html#entry
     * Should be an empty object if it's generating a test build
     * Karma will set this when it's a test build
     */
    config.entry = isTest ? {} : {
        // I've attempted code splitting and it simply doesn't work well with angular.  Future devs beware, it's a dark
        // hole
        pcm: './main.module.js'
    };

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     * Should be an empty object if it's generating a test build
     * Karma will handle setting it up for you when it's a test build
     */
    config.output = isTest ? {} : {
        // Absolute output directory
        path: __dirname + '/dist',

        // Output path from the view of the page
        // Uses webpack-dev-server in development
        // publicPath: isProd ? '/' : 'http://0.0.0.0:9000/',
        // Since FF doesn't handle scripts loaded from different domains, let the access proxy handle any hits to
        // resources, the above using 0.0.0.0:9000 is the standard way to do this without something like accessproxy
        // Filename for entry points
        // Only adds hash in build mode
        // filename: isProd ? '[name].[hash].js' : 'pcm.js',
        filename: "[name].js" + (isProd ? "?[chunkhash]" : "")

        // library: 'pcm'
    };

    config.externals = {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery",
        "$": "jQuery"
    };

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (isTest) {
        config.devtool = 'inline-source-map';
    } else if (isProd) {
        // No source-map in prod
        // config.devtool = 'source-map';
    } else {
        // config.devtool = 'source-map';
        config.devtool = 'cheap-module-eval-source-map';
    }

    /**
     * Loaders
     * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */

    // Initialize module
    config.module = {
        preLoaders: [

            // This works bug produces a ton of content, I don't think we've been strict with jshint so far, commenting
            // this out until we decide what we'd want to do.
            // {
            //     test: /\.js$/,
            //     loader: "jshint-loader",
            //     exclude: [
            //         /node_modules/,
            //         /bower_components/
            //     ]
            // }
        ],
        loaders: [
            // Shim Angular modules
            {
                test: /[\/]angular\.js$/, loader: "exports?angular"
            },
            {
                // JS LOADER
                // Reference: https://github.com/babel/babel-loader
                // Transpile .js files using babel-loader
                // Compiles ES6 and ES7 into ES5 code
                test: /\.js$/,
                // loader: 'babel-loader',
                loader: 'ng-annotate?add=true!babel',
                // exclude: [/node_modules/, /bower_components/]
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'bower_components')
                ]
            },
            {
                test: /redhat_access_pcm_ascension_common/,
                loader: 'ng-annotate?add=true!babel'
            },
            // {
            //     // CSS LOADER
            //     // Reference: https://github.com/webpack/css-loader
            //     // Allow loading css through js
            //     //
            //     // Reference: https://github.com/postcss/postcss-loader
            //     // Postprocess your css with PostCSS plugins
            //     test: /\.css$/,
            //     // Reference: https://github.com/webpack/extract-text-webpack-plugin
            //     // Extract css files in production builds
            //     //
            //     // Reference: https://github.com/webpack/style-loader
            //     // Use style-loader in development.
            //     // loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss')
            //     loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?minimize')
            // },
            {
                test: /\.scss$/,
                // loaders: ["style", "css", "sass"] // This works
                // 'css?sourceMap!sass?sourceMap' // Example on how to use sourceMaps, not sure we need them though
                loader: ExtractTextPlugin.extract('css!sass'),
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'bower_components')
                ]
            },
            // https://github.com/tcoopman/image-webpack-loader
            {
                test: /\.(jpe?g|png|gif|svg)/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
            {
                test: /\.(woff|woff2)/,
                loader: 'url-loader?limit=10000'
            },
            {
                test: /\.(ttf|eot)/,
                loader: 'file-loader'
            },
            {
                // HTML LOADER
                // Reference: https://github.com/webpack/raw-loader
                // Allow loading html through js
                test: /\.html$/,
                loader: 'raw'
            },
            {
                test: /\.txt$/,
                loader: 'raw'
            },
            {
                test: /\.jade$/,
                loader: 'jade-loader'
            },
            {
                test: /\.po$/,
                loader: 'angular-gettext?module=RedhatAccess'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    };

    config.sassLoader = {
        includePaths: [
            // This does resolve to the correct path
            path.resolve(__dirname, "./app/assets/sass"),
            path.resolve(__dirname, "./node_modules/compass-mixins/lib"),
            path.resolve(__dirname, "./node_modules/breakpoint-sass/stylesheets")
        ]
    };

    /**
     * PostCSS
     * Reference: https://github.com/postcss/autoprefixer-core
     * Add vendor prefixes to your css
     */
    config.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        new webpack.DefinePlugin({
            ENVIRONMENT: JSON.stringify(ENV)
        })
    ];

    // Skip rendering index.html in test mode
    if (isProd) {
        // Reference: https://github.com/ampedandwired/html-webpack-plugin
        // Render index.html
        config.plugins.push(
            new HtmlWebpackPlugin({
                // template: './index.html',
                // inject: 'body',
                // // inject: false
                // devServer: false
                template: './chromed.ejs',
                inject: false,
                hash: true,
                isProd: true
            }),

            // Reference: https://github.com/webpack/extract-text-webpack-plugin
            // Extract css files
            // Disabled when in test mode or not in build mode
            // new ExtractTextPlugin('[name].[hash].css', {disable: !isProd})
            new ExtractTextPlugin("[name].css")
        )
    } else if (!isTest) {
        config.plugins.push(
            new HtmlWebpackPlugin({
                // template: './chromed.html',
                // inject: 'body',
                template: './chromed.ejs',
                inject: false,
                hash: true,
                isProd: false
                // devServer: true
            }),

            // Reference: https://github.com/webpack/extract-text-webpack-plugin
            // Extract css files
            // Disabled when in test mode or not in build mode
            // new ExtractTextPlugin('[name].[hash].css', {disable: !isProd})
            new ExtractTextPlugin("[name].css")
        )
    }

    // Excluding all node_module ouput will prevent a lot of spam in the webpack output
    var excludeFromStats = [
        /webpack/,
        /node_modules/,
        /bower_components/
    ];

    // Resolvers
    config.resolve = {
        modulesDirectories: ["node_modules", "bower_components"],
        alias: {
            // 'jquery': resolveBowerPath('/jquery/jquery.js')
            'moment-timezone': 'moment-timezone/builds/moment-timezone-with-data-2010-2020.js'
        }
    };

    // Add resolvers for bower.
    config.plugins.push(
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        )
    );

    config.plugins.push(
        new webpack.ProvidePlugin({
            Uri: 'jsuri'
            // "$": "jquery",
            // "jQuery": "jquery"
            // This fubars the export in the loads, don't use this provide here
            // "angular": "angular"
        })
    );

    // Annotate angular
    // config.plugins.push(
    //     new ngAnnotatePlugin({
    //         add: true
    //     })
    // );

    // Add build specific plugins
    if (isProd) {
        config.plugins.push(
            // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
            // Only emit files when there are no errors
            new webpack.NoErrorsPlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
            // Dedupe modules in the output
            new webpack.optimize.DedupePlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: false,
                compress: {
                    warnings: false,
                    screw_ie8: true
                },
                mangle: false,
                // mangle: {
                //     except: ['$super', '$', 'exports', 'require']
                // },
                'screw-ie8': true
            })

            // Copy assets from the public folder
            // Reference: https://github.com/kevlened/copy-webpack-plugin
            // new CopyWebpackPlugin([{
            //     from: __dirname + '/src/public'
            // }])
        )
    } else {
        config.plugins.push(
            new StatsPlugin("stats.json", {
                chunkModules: true,
                exclude: excludeFromStats
            })
        )
    }


    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {
        // contentBase: './src/public',
        stats: 'minimal',
        // contentBase: './app'
        contentBase: './'
    };

    return config;
};
