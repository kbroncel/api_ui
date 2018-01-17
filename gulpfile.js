"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const browserify = require("gulp-browserify");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const htmlreplace = require("gulp-html-replace");
const concatCss = require("gulp-concat-css");

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

gulp.task("build", ["uglify", "copyCss", "copyResource", "copyHtml", "copyServer"]);

gulp.task("uglify", function(){
    return gulp.src("./assets/js/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("./dist"))
})
gulp.task("copyCss", function(){
    return gulp.src("./assets/css/*css")
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest("./dist"))
})
gulp.task("copyResource", function(){
    return gulp.src("./resources/*")
        .pipe(gulp.dest("./dist/resources/"))
})
gulp.task("copyHtml", function(){
    return gulp.src("./index.html")
        .pipe(htmlreplace({
            "css": "main.css",
            "js": "main.js"
        }))
        .pipe(gulp.dest("./dist"))
})
gulp.task("copyServer", function(){
    return gulp.src("./server.js")
        .pipe(gulp.dest("./dist"))
})