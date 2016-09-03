'use strict';

const
    eslint_conf = require('./.eslintrc'),
    gulp        = require('gulp'),
    del         = require('del'),
    eslint      = require('gulp-eslint'),
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    connect     = require('gulp-connect'),
    uglify      = require('gulp-uglify'),
    minifyCss   = require('gulp-clean-css'),
    gutil       = require('gulp-util'),
    ngAnnotate  = require('gulp-ng-annotate'),

    CONNECT_SERVER = {
        'port'       : 1313,
        'livereload' : true,
        'fallback'   : 'index.html'
    },

    APP_PREFIX            = 'afrm',
    SRC_CODE              = [ './app/app-module.js', './app/**/*.js', './app/shared/filters/*.js', './app/shared/directives/*.js' ],
    ASSETS_PATH           = [ 'assets/**/img/*.*', 'assets/**/icons/*.*' ],
    WATCH_RELOAD          = [ './app/**/*.*', './assets/**/*.*' ],
    WATCH_RELOAD_TEMPLATE = [ 'index.html', 'conf.json', './app/**/*.html' ],
    FOLDERS_TO_CLEAN      = [ 'build', 'dist', 'release' ],
    CSS_PATHS             = [ './app/**/*.css', './assets/css/*.css' ],
    DIST_PATH             = './dist/',
    CSS_DIST_PATH         = './dist/assets/css',
    ASSETS_DIST_PATH      = './dist/assets/';

// task chain definidtions
gulp.task('default', [ 'all' ]);
gulp.task('all',     [ 'test', 'build' ]);
gulp.task('test',    [ 'eslint' ]);
gulp.task('dev',     [ 'connect', 'watch' ]);
gulp.task('build',   [ 'build:bundle', 'minify:css', 'build:min', 'copy:assets' ]);

/* GULP TASKS */
gulp.task('clean', () => { del(FOLDERS_TO_CLEAN); });

/* ESLint rules: http://eslint.org/docs/rules */
gulp.task('eslint', () => { gulp.src(SRC_CODE).pipe(eslint(eslint_conf)).pipe(eslint.format()); });

// Bundle Files
gulp.task('build:bundle', () => { gulp.src(SRC_CODE).pipe(concat(APP_PREFIX + '.js')).pipe(gulp.dest(DIST_PATH)); });

// Build .min files
gulp.task('build:min', () => {
    gulp.src(SRC_CODE)
        .pipe(sourcemaps.init())
          .pipe(concat(APP_PREFIX + '.min.js'))
          .pipe(ngAnnotate())
          .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH));
});

// Minify CSS
gulp.task('minify:css', () => {
    gulp
        .src(CSS_PATHS)
        .pipe(sourcemaps.init())
        .pipe(concat(APP_PREFIX + '.min.css'))
        .pipe(minifyCss({ 'processImport': false }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(gutil.env.src || CSS_DIST_PATH));
});

// Copy assets folder
gulp.task('copy:assets', () => { gulp.src(ASSETS_PATH).pipe(gulp.dest(ASSETS_DIST_PATH)); });

// Websocket Http Server
gulp.task('connect', [ 'all' ], () => { connect.server(CONNECT_SERVER); });

// Watch for changes in files
gulp.task('watch', () => {
    gulp.watch(WATCH_RELOAD_TEMPLATE, [ 'reload:template' ]);
    gulp.watch(WATCH_RELOAD, [ 'reload' ]);
});

// Live Reload
gulp.task('reload', [ 'all' ], () => { connect.reload(); });

// Reload CSS & HTML
gulp.task('reload:template', () => { connect.reload(); });