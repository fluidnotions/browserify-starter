
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('gulp-buffer');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var webserver = require('gulp-webserver');

// [
//   './src/utils.js',
//   './src/xmain.js',
// ]

gulp.task('build', function() {
  return browserify({
      entries: './src/xmain.js'
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'));

});

gulp.task('watch', function () {
    watch('./src/*.js', batch(function (events, done) {
        gulp.start('build', done);
    }));
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true,
      port: 9000
    }));
});

gulp.task('default', ['webserver', 'watch']);
