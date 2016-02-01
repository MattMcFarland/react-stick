const gulp = require('gulp');
const gutil = require('gulp-util');
const nodemon = require('gulp-nodemon');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const envify = require('envify');
const lrload = require('livereactload');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const ugOpts = require('./config/uglify');

var isProd = process.env.NODE_ENV === 'production';

var bundler = browserify({
  entries: [ './src/index.js' ],
  transform: [ [babelify, {}], [envify, {}] ],
  plugin: isProd ? [] : [ lrload ],
  debug: !isProd,
  cache: {},
  packageCache: {},
  fullPaths: !isProd
});


gulp.task('bundle:js', function () {
  bundler
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify(ugOpts))
    .on('end', () => {
      gutil.log('File Saved', gutil.colors.cyan('main.js'));
    })
    .pipe(gulp.dest('public/js'));
});

gulp.task('watch:js', function () {
  // start JS file watching and rebundling with watchify
  var watcher = watchify(bundler);
  rebundle();
  return watcher
    .on('error', gutil.log)
    .on('update', rebundle);

  function rebundle() {
    gutil.log('Update JavaScript bundle');
    watcher
      .bundle()
      .on('error', gutil.log)
      .pipe(source('main.js'))
      .pipe(buffer())
      .on('end', () => {
        gutil.log('File Saved', gutil.colors.cyan('main.js'));
      })
      .pipe(gulp.dest('public/js'));
  }
});

gulp.task('watch:server', function () {
  nodemon({
    script: 'bin/server.js',
    ext: 'js, css',
    ignore: ['gulpfile.js', 'public/js/*', 'node_modules/*']
  }).on('change', [])
    .on('restart', function () {
      gutil.log('Server Restarted.');
    });
});

gulp.task('watch:sass', function () {
  return gulp.watch('src/style/**/*.scss', ['sass']);
});

gulp.task('sass', function () {
  return gulp.src('src/style/main.scss')
    .pipe(sass())
    .on('error', gutil.log)
    .on('end', () => {
      gutil.log('File Saved', gutil.colors.cyan('public/css/main.css'));
    })
    .pipe(gulp.dest('public/css'));
});



gulp.task('default', ['watch:server', 'watch:js', 'watch:sass']);
