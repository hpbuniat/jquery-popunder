module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/* <%= pkg.description %>, v<%= pkg.version %> <%= pkg.homepage %>\n' +
                'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>, <%= pkg.license.type %> license ' +
                '<%= pkg.license.url %>*/\n'
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
        uglify:{
            dist:{
                files: {
                    'dist/jquery.popunder.min.js': ['src/jquery.popunder.js']
                },
                options: {
                    banner: '<%=meta.banner%>'
                }
            },
            jqLess:{
                files: {
                    'dist/popunder.min.js': ['src/jquery.min.js', 'src/jquery.popunder.js']
                },
                options: {
                    banner: '<%=meta.banner%>'
                }
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


    // load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify', 'shell']);
};
