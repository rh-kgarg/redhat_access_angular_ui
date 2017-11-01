module.exports = {
    host: "qa.foo.redhat.com",
    port: 1337,
    open: true,
    startPath: "/support/cases/",
    verbose: true,
    routes: {
        // Here are some routing examples to get started.

        // Route a URL path to a local directory.
        "/support/cases": { host: "http://localhost:9000" },

        // Route a URL path to an app server.
        // This is most useful for testing local files (esp JS and CSS) against
        // a remote QA or production server.
        "/": { host: "https://access.qa.redhat.com" }

        // Route a URL path to an app server, and watch local files for changes.
        // This is most useful for putting a local development at a certain
        // path on your spandx server.  Includes browser-sync auto-reloading.
        // '/': { host: 'http://localhost:8080/', watch: '~/projects/my-app' },
    },
    bs: {
        https: true
    }
};

