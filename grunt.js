module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // run jshint on the files, with the options described below. Different globals defined based on file type
    // 'node' for files that are run by node.js (module, process, etc.)
    // 'browser' for files that are run by a browser (window, document, etc.)
    lint: {
      all: ['jquery.popunder.js']
    },
    jshint: {
      // Apply to all js files
      options: {
        curly: true,
        eqeqeq: true,
        forin: true,
        indent: 2,
        latedef: false,
        newcap: true,
        noarg: true,
        noempty: true,
        white: false,
        sub: true,
        undef: true,
        unused: true,
        loopfunc: true,
        expr: true,
        evil: true,
        eqnull: true
      }
    },
    min: {
      dist: {
        src: ['jquery.popunder.js'],
        dest: 'dist/jquery.popunder.min.js'
      }
    },

    watch: {
      files: ['*.js'],
      tasks: 'lint'
    }

  });

  // This is what gets run when you don't specify an argument for grunt.
  grunt.registerTask('default', 'lint min');

};
