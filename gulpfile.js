'use strict';

const gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    jscs = require('gulp-jscs'),
    minify = require('gulp-minify'),
    webpack = require('webpack'),
    webpackComponents = require('./webpack.config.js'),
    pkg = require('./package.json');

function createDist() {
    /* bundles that are hosted */
    gulp.src('src/injector.js')
        .pipe(minify({
            ext: {
                src: `.lite.${pkg.version}.js`,
                min: `.lite.${pkg.version}.min.js`
            }
        }))
        .pipe(gulp.dest('bundles'));

    /* files for dist */
    gulp.src('src/injector.js')
        .pipe(minify({
            ext: {
                src: `.lite.js`,
                min: `.lite.min.js`
            }
        }))
        .pipe(gulp.dest('dist'));

    gutil.log('src/injector.js', 'moved to dist/');
}

gulp.task('dist', function (callback) {
    webpack(webpackComponents, function (err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack:components', err);
        }
        let bundleStats = stats.toJson();

        fs.writeFile(`./bundles/manifest.${pkg.version}.json`, JSON.stringify(bundleStats.assets).replace(/bundles\//g, ''), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('manifest file saved');
            }
        });

        gutil.log('[webpack:components]', stats.toString({
            colors: true
        }));

        callback(createDist());
    });
});

/* linting */
gulp.task('lint', function () {
    const src = ['./src/**/*.js', './webpack.config.js'];

    function linting () {
        /*jscs*/
        gulp.src(src)
            .pipe(jscs())
            .pipe(jscs.reporter())
            .pipe(eslint())
            .pipe(eslint.failOnError())
            .on('error', (error) => {
                gutil.log('ERROR:', error);
            });

    }
    return linting();
});

/* Test */
gulp.task('test', ['lint']);

/* Build */
gulp.task('build', ['test', 'dist']);

/* Default Task */
gulp.task('default', ['test']);
