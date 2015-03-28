module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
   		 'webpack',
		'less:dev',
		'sync:dev',
	]);
};
