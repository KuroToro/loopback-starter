module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    site: {
      app:   'app',
      bower: 'app/vendor'
    },
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= pkg.description %> \n'+
            ' * <%= pkg.license %> \n' +
            ' */',

    less: {
      development: {
        options: {
          paths: [
            '<%= site.bower %>/bootstrap/less',
            'server/views/_styles'
          ],
          strictMath: true,
          syncImport: true,
          strictImports: true
        },
        files: {
          '<%= site.app %>/assets/css/style.css': 'server/views/_styles/bootstrap.less'
        }
      },
      production: {
        options: {
          paths: [
            '<%= site.bower %>/bootstrap/less',
            'server/views/_styles'
          ],
          compress: true,
          sourceMap: true,
          strictMath: true,
          syncImport: true,
          strictImports: true,
          sourceMapFilename: '<%= site.app %>/assets/css/style.min.map'
        },
        files: {
          '<%= site.app %>/assets/css/style.min.css': 'server/views/_styles/bootstrap.less'
        }
      }
    }
  });

  grunt.registerTask('default', []);
  grunt.registerTask('styles', ['less']);
};