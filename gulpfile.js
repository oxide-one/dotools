'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const nunjucks = require('gulp-nunjucks');
const { series } = require('gulp');
const { watch } = require('gulp');

function buildTemplates() {
  return gulp.src('src/*.html')
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'))
}

function buildStyles() {
  return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
};

function buildJS() {
  return gulp.src('./src/js/*.js')
  .pipe(gulp.dest('dist/js'))
}


exports.default = function() {
    watch(['src/*.html', 'src/js/*.js', 'src/template/*.html'], series(buildTemplates, buildJS))
}

exports.build = series(buildStyles, buildTemplates, buildJS)