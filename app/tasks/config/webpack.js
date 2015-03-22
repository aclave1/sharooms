module.exports = function (grunt) {

  grunt.config.set('webpack', {
    options: require('../../webpack.config'),
    app: {
      progress: true
    }
  });

  grunt.loadNpmTasks('grunt-webpack');
};
