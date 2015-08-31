module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
		  files: ['src/**/*.js'],
		  options: {
			globals: {
			  jQuery: true
			}
		  }
		},
		uglify:{
			my_target : {
				files : {
					'dist/jquery.circularSelect.min.js' : ['src/jquery.circularSelect.js']
				}	
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('default',['jshint','uglify'])

};