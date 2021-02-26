const gulp = require('gulp')
const sass = require('gulp-sass')
const uglifycss = require('gulp-uglifycss')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const htmlmin = require('gulp-html-minifier-terser')

/**
 * CSS / Sass Tasks
 */

// Sass compiler
gulp.task('sass', done => {
    gulp.src('src/style/style.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/style'))
        .pipe(gulp.dest('dist/style'))
    done()
})

// CSS minifier
gulp.task('css', done => {
    gulp.src('dist/style/style.css')
        .pipe(uglifycss({
            "uglyComments": true
        }))
        .pipe(gulp.dest('dist/style'))
    done()
})

/**
 * JavaScript Tasks
 */

// JS transpiler
gulp.task('js', done => {
    gulp.src('src/js/main.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist/js'))
    done()
})

// JS minifier
gulp.task('js-min', done => {
    gulp.src('dist/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
    done()
})

/**
 * File Tasks
 */

// HTML tracker
gulp.task('html', done => {
    gulp.src('src/index.html')
        .pipe(gulp.dest('dist'))
    done()
})

// HTML minifier
gulp.task('html-min', done => {
    gulp.src('src/index.html')
        .pipe(htmlmin({caseSensitive: true, removeComments: true, collapseWhitespace: true, ignoreCustomComments: true}))
        .pipe(gulp.dest('dist'))
    done()
})

// Image tracker
gulp.task('img', done => {
    gulp.src('src/img/**/*.+(png|jpeg)')
        .pipe(gulp.dest('dist/img'))
    done()
})

/**
 * jQuery Plugin Tasks
 */

// Pushy compiler
gulp.task('pushy', done => {
    gulp.src('src/js/pushy/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/js/pushy/css'))
        .pipe(gulp.dest('dist/js/pushy/css'))
    done()
})

// Slick compiler
gulp.task('slick', done => {
    gulp.src('src/js/slick/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/js/slick'))
        .pipe(gulp.dest('dist/js/slick'))
    done()
})

// Plugin CSS minifier
gulp.task('plugin-min', done => {
    gulp.src('src/js/pushy/css/*.css')
        .pipe(uglifycss({
            "uglyComments": true
        }))
        .pipe(gulp.dest('dist/js/pushy/css'))
    gulp.src('src/js/slick/*.css')
        .pipe(uglifycss({
            "uglyComments": true
        }))
        .pipe(gulp.dest('dist/js/slick'))
    done()
})

/**
 * Watcher
 */
gulp.task('watch', function() {
    gulp.watch('src/style/**/*.scss', gulp.series('sass'))
    gulp.watch('src/js/main.js', gulp.series('js'))
    gulp.watch('src/index.html', gulp.series('html'))
    gulp.watch('src/img/**/*.+(png|jpeg)', gulp.series('img'))
    gulp.watch('src/js/pushy/scss/*.scss', gulp.series('pushy'))
    gulp.watch('src/js/slick/*.scss', gulp.series('slick'))
})