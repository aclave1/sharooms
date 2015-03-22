module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
    'webpack',
		'jst:dev',
		'less:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
