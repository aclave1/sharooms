module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'webpack',
		'less:dev',
		'copy:dev',
	]);
};
