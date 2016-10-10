// Karma configuration
// Generated on Sat Oct 08 2016 17:41:18 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      './node_modules/angular/angular.js',                             // angular
      './node_modules/angular-ui-router/release/angular-ui-router.js',                     // ui-router
      './node_modules/angular-mocks/angular-mocks.js',               // loads our modules for tests

      './vendor/angular-route/angular-route.js',
      './vendor/angular-material/angular-material.js',
      './vendor/angular-animate/angular-animate.js',
      './vendor/angular-material-data-table/dist/md-data-table.js',
      './vendor/angular-aria/angular-aria.js',
      './vendor/angular-filter/dist/angular-filter.js',

      './app/app-module.js',

      './app/shared/services/credentials.service.js',
      './app/components/login/login.controller.js',
      './app/components/login/login.spec.js',

      './app/shared/services/internships.service.js',
      './app/components/internships/internships.controller.js',
      './app/components/internships/internships.spec.js'

    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
