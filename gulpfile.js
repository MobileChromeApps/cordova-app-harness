// Adopted from:
// https://github.com/webpack/webpack-with-common-libs/blob/master/gulpfile.js
//

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

// Default, Watch -> Dev Build
gulp.task('default', ['lint', 'webpack:build-dev'], function() {
  gulp.watch([
      'www/**/*',
      'webpack.config.js',
      //'node_modules/**/*', // disabled because of https://github.com/gruntjs/grunt-contrib-watch#how-do-i-fix-the-error-emfile-too-many-opened-files
    ], ['lint', 'webpack:build-dev']);
});

gulp.task('build-dev', ['lint', 'webpack:build-dev']);

gulp.task('build', ['lint', 'webpack:build']);

gulp.task('lint:app', function() {
  return gulp.src(['www/**/*.js', '!www/cdvah/js/libs/*.js', '!www/cdvah/generated/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint:harness-push', function() {
  return gulp.src(['harness-push/*.js', 'harness-push/node_modules/chrome-app-developer-tool-client/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['lint:app', 'lint:harness-push']);


/******************************************************************************/
/******************************************************************************/

function createWebpackResultHandler(taskname, callback) {
  return function(err, stats) {
    if(err) throw new gutil.PluginError(taskname, err);
    gutil.log('[' + taskname + ']', stats.toString({
      colors: true
    }));
    callback();
  }
}

gulp.task('webpack:build', function(callback) {
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = (myConfig.plugins || []).concat(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  // run webpack
  webpack(myConfig, createWebpackResultHandler('webpack:build', callback));
});

gulp.task('webpack:build-dev', (function() {
  // modify some webpack config options
  var myDevConfig = Object.create(webpackConfig);
  myDevConfig.devtool = 'sourcemap';
  myDevConfig.debug = true;

  // create a single instance of the compiler to allow caching
  var devCompiler = webpack(myDevConfig);

  return function(callback) {
    // run webpack
    devCompiler.run(createWebpackResultHandler('webpack:build-dev', callback));
  };
}()));
