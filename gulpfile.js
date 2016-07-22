'use strict';

let gulp = require('gulp');
let templateCache = require('gulp-angular-templatecache');
let typescript = require('gulp-typescript');

gulp.task('build:html', () => {
   return gulp.src([
       'app/**/*.html'
   ])
   .pipe(templateCache('app.template.js', { module: 'app.templates', standalone: true }))
   .pipe(gulp.dest('./public'));

});

gulp.task('build:js', () => {
    return gulp.src([
        'app/**/*Module.ts',
        'app/**/*.ts',
        'app/app.ts'
    ])
    .pipe(typescript({
        out: 'app.js',
        noImplicitAny: true
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('default', ['build:js', 'build:html'], () => {
    gulp.watch('app/**/*.ts', ['build:js']);
    gulp.watch('app/**/*.html', ['build:html']);
});