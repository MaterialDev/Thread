'use strict';

let gulp = require('gulp');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let sassSyntax = require('postcss-scss');
let sourcemaps = require('gulp-sourcemaps');
const ngAnnotate = require('gulp-ng-annotate');
let immutable = require('immutable-css');
let autoprefixer = require('autoprefixer');
let reporter = require('postcss-reporter');
let stylelint = require('stylelint');
let typescript = require('gulp-typescript');
let templateCache = require('gulp-angular-templatecache');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let minCss = require('gulp-clean-css');
let browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    })
});

gulp.task('build:css', () => {
    gulp.src([
        './styles/settings/*.scss',
        './styles/tools/*.scss',
        './styles/base/*.scss',
        './styles/components/*.scss',
        './styles/layout/*.scss',
        './styles/main.scss',
        './components/**/*.scss'
    ])
    .pipe(postcss([
        stylelint(),
        immutable,
        autoprefixer({ browsers: ['last 2 versions']}),
        reporter({ clearMessages: true })
    ], { syntax: sassSyntax }))
    .pipe(concat('thread.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
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
    .pipe(ngAnnotate())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'));
});

gulp.task('publish:js', () => {
    gulp.src('./dist/thread.js')
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./dist'))
});

gulp.task('publish:css', () => {
    gulp.src('./dist/thread.css')
    .pipe(minCss())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./dist'))
});

gulp.task('build-site:html', () => {
    return gulp.src([
        'documentation/**/*.html'
    ])
    .pipe(templateCache('app.template.js', { module: 'app.templates', standalone: true }))
    .pipe(gulp.dest('./public'));

});

gulp.task('build-site:js', () => {
    return gulp.src([
        'documentation/**/*Module.ts',
        'documentation/**/*.ts',
        'documentation/app.ts'
    ])
    .pipe(typescript({
        out: 'app.js',
        noImplicitAny: true
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('build-site:css', () => {
    return gulp.src('documentation/*.css')
    .pipe(gulp.dest('./public'));
});

gulp.task('build-site', ['build-site:css', 'build-site:js', 'build-site:html']);
gulp.task('build', ['build:css', 'build:js']);
gulp.task('publish', ['publish:css', 'publish:js']);

gulp.task('default', ['build', 'build-site', 'browser-sync'], () => {
    gulp.watch(['./styles/**/*.scss', './components/**/*.scss'], ['build:css']);
    gulp.watch(['app.ts', './components/**/*.ts'], ['build:js']);
});
