module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		files: {
			srcJS: 'src/**/*.js',
			compiledJS: 'dest/ngCharts.js',
			minifiedJS: 'dest/ngCharts.min.js'
		},

		jshint: {
			all: {
				src: '<%= files.srcJS %>'
			}
		},

		concat: {
			options: {
				stripBanners: true
			},

			ngCharts : {
				src: '<%= files.srcJS %>',
				dest: '<%= files.compiledJS %>'
			}
		},


		uglify: {
			options: {
				preserveComments: false,
				banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n',
				report: 'min',
				compress: {
					drop_console: true
				}
			},
			production: {
				files: {
					'<%= files.minifiedJS %>' : '<%= files.srcJS %>',
				}
			}
		},

		watch: {

			js: {
				files: '<%= files.srcJS %>',
				tasks: ['jshint', 'concat', 'uglify:production'],
				drop_console: true
			},

		},

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');


	// Default task for developing the development version.
	grunt.registerTask('default', ['jshint', 'concat', 'uglify:production']);

};
