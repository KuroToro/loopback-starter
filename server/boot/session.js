'use strict';

module.exports = (app) => {
  let config = require('../datasources.json')
  let session = require('express-session')
  let redis = require('redis')
  let RedisStore = require('connect-redis')(session)

  let client = redis.createClient()
  let options = {}
  Object.assign(options, config.sessionStore, client)


  app.middleware('session', session({
    key: 'app.sid',
    store: new RedisStore(options),
    resave: false,
    secret: 'kitty',
    saveUninitialized: false,
  }));
};
