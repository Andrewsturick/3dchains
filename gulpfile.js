'use strict';

var gulp = require('gulp');
var rimraf = require('rimraf')
var bower = require('gulp-bower');
var gutil = require('gulp-util');
var run = require('gulp-run')
var concat = require('gulp-concat')
var addsrc = require('gulp-add-src');

gulp.task('default', ['build', 'watch'])

gulp.task('watch', function() {
	gulp.watch('source/**/*', ['build']);
});

gulp.task('build', ['clean'], function(){
	gulp.src('source/**/*.js')
		.pipe(concat("bundle.js"))
		.pipe(addsrc("source/**/*.html"))
    .pipe(addsrc("source/**/*.css"))
		.pipe(gulp.dest('public'))
	gulp.src('assets/**/*')
		.pipe(gulp.dest('public/assets'))
	gulp.src('d3threejsAssets/**/*')
		.pipe(gulp.dest('public/d3threejsAssets'))
		.on('error', gutil.log)
})

gulp.task('clean', function(cb) {
	rimraf('public', cb);
})
