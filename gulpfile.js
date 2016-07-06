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
let babel = require('gulp-babel');
let concat = require('gulp-concat');

gulp.task('build:css', () => {
    gulp.src([
        './styles/base/_variables.scss',
        './styles/base/*.scss',
        './styles/components/*.scss',
        './styles/main.scss',
        './components/**/*.scss'
    ])
    .pipe(sourcemaps.init())
    .pipe(postcss([
        stylelint(),
        immutable,
        autoprefixer({ browsers: ['last 2 versions']}),
        reporter({ clearMessages: true })
    ], { syntax: sassSyntax }))
    .pipe(concat('thread.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:js', () => {
    gulp.src([
        '!./components/**/*.spec.js',
        './components/**/*.module.js',
        './components/**/*.js',
        'app.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('thread.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build:css', 'build:js'], () => {
    gulp.watch(['./styles/**/*.scss', './components/**/*.scss'], ['build:css']);
    gulp.watch(['app.js', './components/**/*.js'], ['build:js']);
});