
module.exports = function (app) {
  this.auth = {};

  this.auth['/'] = {
    config: {
      method: 'get',
      ensure: false,
      meta: {
        title: 'Home Page'
      }
    },
    middleware: [
      function (req, res, next) {
        req.page = this.auth[req.path].config.meta;
        res.render('pages/index', {
          user: req.user,
          page: req.page,
          url: req.url
        });
      }
    ]
  };

  this.auth['/auth/account'] = {
    config: {
      method: 'get',
      ensure: true,
      meta: {
        title: 'Profile Settings'
      }
    },
    middleware: [
      function (req, res, next) {
        req.page = this.auth[req.path].config.meta;
        res.render('pages/profile', {
          user: req.user,
          page: req.page,
          url: req.url,
          str: function (str) {
            return JSON.stringify(str, null, 2)
          }
        });
      }
    ]
  };

  this.auth['/auth/account/update'] = {
    config: {
      method: 'post',
      ensure: true,
      meta: {
        title: 'Profile Settings'
      }
    },
    middleware: [
      function (req, res, next) {
        var User = app.models.user;
        var update = {
          id: req.user.id
        }; Object.assign(update, req.body);

            User.updateAttributes(update, function (err, updated) {
              if (!err && updated) {
                res.redirect('/auth/account')
              }
            })
      }
    ]
  };


  this.auth['/signup'] = {
    config: {
      method: 'get',
      ensure: false,
      meta: {
        title: 'Local Page'
      }
    },
    middleware: [
      function (req, res, next) {
        req.page = this.auth[req.path].config.meta;
        req.page.name = 'local'
        res.render('pages/login', {
          user: req.user,
          page: req.page,
          url: req.url
        });
      }
    ]
  };

  // this.auth['/signup'] = {
  //   config: {
  //     method: 'get',
  //     ensure: false,
  //     meta: {
  //       name: 'signup',
  //       title: 'Sign Up Page'
  //     }
  //   },
  //   middleware: [
  //     function (req, res, next) {
  //       req.page = this.auth[req.path].config.meta;
  //       res.render('pages/login', {
  //         user: req.user,
  //         page: req.page,
  //         url: req.url
  //       });
  //     }
  //   ]
  // };



  this.auth['/login'] = {
    config: {
      method: 'get',
      ensure: false,
      meta: {
        name: 'login',
        title: 'Sign Up Page'
      }
    },
    middleware: [
      function (req, res, next) {
        req.page = this.auth[req.path].config.meta;
        res.render('pages/login', {
          user: req.user,
          page: req.page,
          url: req.url
        });
      }
    ]
  };

  this.auth['/create-account'] = {
    config: {
      method: 'post',
      ensure: false,
      meta: {
        name: 'signup',
        title: 'Sign Up Page'
      }
    },
    middleware: [
      function (req, res, next) {
        var User = app.models.user;
        var AccessToken = app.models.accessToken;
        var signup = {
          email: req.body.email.toLowerCase(),
          username: req.body.email.toLowerCase(),
          password: req.body.password,
          fullname: req.body.fullname
        };

        User.create(signup, function (err, user) {
          if (err) {
            console.log(err)
            req.flash('error', err.message);
            return res.redirect('back');
          } else {
            User.accessToken.createAccessTokenId(function (data, token) {
              User.accessToken.create({
                userId: user.id,
                ttl: (1000 * 60 * 24),
                id: token,
              }, function (err, data) {
                User.login(signup, function (err) {
                  if (err) {
                    console.log(err)
                    req.flash('error', err.message);
                    return res.redirecuset('back');
                  }
                  return res.redirect('/auth/account');
                });
              });
            });
          }
        });

      }
    ]
  };

  return this.auth;
};