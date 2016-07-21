'use strict';

let gulp = require('gulp');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let sassSyntax = require('postcss-scss');
let sourcemaps = require('gulp-sourcemaps');
let immutable = require('immutable-css');
let autoprefixer = require('autoprefixer');
let reporter = require('postcss-reporter');
let stylelint = require('stylelint');
let typescript = require('gulp-typescript');
let concat = require('gulp-concat');

gulp.task('build:css', () => {
    gulp.src([
        './styles/base/_variables.scss',
        './styles/base/*.scss',
        './styles/components/*.scss',
        './styles/layout/*.scss',
        './styles/main.scss',
        './styles/healthcheck.scss',
        './components/**/*.scss'
    ])
    //.pipe(sourcemaps.init())
    .pipe(postcss([
        stylelint(),
        immutable,
        autoprefixer({ browsers: ['last 2 versions']}),
        reporter({ clearMessages: true })
    ], { syntax: sassSyntax }))
    .pipe(concat('thread.css'))
    .pipe(sass().on('error', sass.logError))
    //.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:js', () => {
    gulp.src([
        '!./components/**/*.spec.js',
        './components/**/*.module.ts',
        './components/**/*.ts',
        'app.ts'
    ])
    .pipe(sourcemaps.init())
    .pipe(typescript({
        out: 'thread.js'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build:css', 'build:js']);

gulp.task('default', ['build:css', 'build:js'], () => {
    gulp.watch(['./styles/**/*.scss', './components/**/*.scss'], ['build:css']);
    gulp.watch(['app.ts', './components/**/*.ts'], ['build:js']);
});