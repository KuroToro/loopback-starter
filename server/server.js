'use strict';

var flash       = require('express-flash')
var bodyParser  = require('body-parser');
var request     = require('request');
var loopback    = require('loopback');
var boot        = require('loopback-boot');
var app         = module.exports = loopback();
var router      = app.loopback.Router();

// Passport Configurators
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

let config = {};
try {
  config = require('../common/providers/providers.local.json');
} catch (err) {
  console.trace(err);
  process.exit(1);
}

// Initialize Template Engine: Nunjucks via Consolidate
let path     = require('path');
let nunjucks = require('nunjucks');

nunjucks.configure([path.join(__dirname, '/../app/public')], {
  autoescape: true,
  express: app,
  watch: true
});

app.set('view engine', 'html');

// --- Begin Boot -----
// boot scripts mount components like REST API
boot(app, __dirname);

// to support JSON-encoded bodies
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

// Current Context
app.use(loopback.context())
app.use(loopback.cookieParser(app.get('cookieSecret')));

// The access token is only available after boot
app.use(loopback.token({
  model: app.models.accessToken
}));

// We need flash messages to see passport errors
app.use(flash());

app.middleware('session:before', loopback.cookieParser(app.get('cookieSecret')));
app.middleware('session', loopback.session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true
}));

// Initialize Passport Config
passportConfigurator.init();

// Configure passport to setup user models
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential
});

for (let s in config) {
  let c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var routes = require('./routes/main')(app);

app.use(router)

// Routes
for (let i in routes.auth) {
  let r = routes.auth[i];
  if (Object.keys(r.length > 0)) {
    (Object.keys(r.config) && !r.config.ensure) ?
      router[r.config.method](i, r.middleware) :
      router[r.config.method](i, ensureLoggedIn('/login'), r.middleware);
  }
}

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
app.use('/assets', app.loopback.static(path.join(__dirname, '../app/assets')));
app.use('/app', app.loopback.static(path.join(__dirname, '../app/admin')));


// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
    console.log('OAuth Providers using', (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development', 'auth callback');
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}