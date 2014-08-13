module.exports = function(grunt) {

    "use strict";

    var
        packageJs = [
            "../src/base/sr.js",
            "../src/base/util.js",
            "../src/base/events.js",
            "../src/base/template.js",
            "../src/base/app.js",
            "../src/ui/ui.js"
        ];

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat:{
            options: {
                separator: ''
            },
            basic_and_extras: {
                files: {
                    "../output/<%= pkg.name %>.debug.js": packageJs
                }
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            my_target: {
                files: {
                    "../output/<%= pkg.name %>.min.js": "../output/<%= pkg.name %>.debug.js"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask("default", ["concat", "uglify"]);

};
