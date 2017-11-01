module.exports = require("./webpack.config")({
    env: "dev",
    devServer: true,
    publicPath: "/support/cases/",
    devtool: "cheap-module-eval-source-map",
    debug: true
});
