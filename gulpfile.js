"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const browserify = require("gulp-browserify");
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');

gulp.task("sass", function () {
    return gulp.src("./src/scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./assets/css"));
});

gulp.task("js", function () {
    return gulp.src("./src/js/**/*.js")
        .pipe(browserify())
        .pipe(babel({ presets: ["env"] }))
        .pipe(gulp.dest("./assets/js"));
});

gulp.task("watch", function () {
    gulp.watch("./src/scss/**/*.scss", ["sass"]);
    gulp.watch("./src/js/**/*.js", ["js"]);
});

gulp.task("build", function () {
    return gulp.src('./assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
})