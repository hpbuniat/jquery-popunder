module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/* <%= pkg.description %>, v<%= pkg.version %> <%= pkg.homepage %>\n' +
                'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>, <%= pkg.license.type %> license ' +
                '<%= pkg.license.url %> */'
        },
        lint:{
            all:['src/*.js']
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                forin:true,
                indent:2,
                latedef:false,
                newcap:true,
                noarg:true,
                noempty:true,
                white:false,
                sub:true,
                undef:true,
                unused:true,
                loopfunc:true,
                expr:true,
                evil:true,
                eqnull:true
            }
        },
        min:{
            dist:{
                src:['<banner:meta.banner>', 'src/jquery.popunder.js'],
                dest:'dist/jquery.popunder.min.js'
            },
            jqLess:{
                src:['<banner:meta.banner>', 'src/jquery.compat.js', 'src/jquery.popunder.js'],
                dest:'dist/popunder.min.js'
            }
        },
        shell:{
            build: {
                command: 'haxe compile.hxml',
                stdout: true,
                stderr: true,
                execOptions: {
                    cwd: './src/hx'
                }
            },
            copy: {
                command: 'mv ./src/hx/jq-pu-toolkit.swf ./dist/jq-pu-toolkit.swf',
                stderr: true,
                stdout: true
            }
        },
        watch:{
            files:['src/*.js'],
            tasks:'lint'
        }

    });

    grunt.loadNpmTasks('grunt-shell');

    // This is what gets run when you don't specify an argument for grunt.
    grunt.registerTask('default', 'lint min shell');

};
