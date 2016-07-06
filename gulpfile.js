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

gulp.task('build', () => {
    gulp.src('./styles/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(postcss([
            stylelint(),
            immutable,
            autoprefixer({ browsers: ['last 2 versions']}),
            reporter({ clearMessages: true })
        ], { syntax: sassSyntax }))
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(rename('thread.css'))
        .pipe(gulp.dest('./dist'));
});