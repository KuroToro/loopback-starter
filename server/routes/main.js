'use strict';

module.exports = (app) => {
  this.auth = require('./auth')(app)

  return this
};
