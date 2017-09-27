const passport = require('passport');
const userController = require(__dirname+'/auth/../apps/csystem/controllers/user');


class authroutes
{
  constructor(app, passport)
  {
    /**
     * OAuth authentication routes. (Sign in)
     */
    let returnto = "/#"
    app.get('/auth/logout', userController.logout);
    app.post('/auth/signupinside/:type?', userController.postSignupinside);
    app.post('/auth/signininside', userController.postSignininside);
    app.post('/auth/unlink/:account', userController.postUnlink);
    app.post('/auth/drop/:uid', userController.postDeleteAccountInside);
    app.post('/auth/disable/:uid/:status', userController.postDisableAccountInside);
    app.post('/auth/password/:password/:confirmpassword/:oldpassword/:id?', userController.postUpdatePassword);

    app.post('/auth/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);

    app.get('/auth/instagram', passport.authenticate('instagram'));
    app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });
    app.get('/auth/github', passport.authenticate('github'));
    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });
    app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });
    app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/auth/' }), (req, res) => {
      res.redirect(returnto || req.session.returnTo || '/auth/');
    });

    /**
     * OAuth authorization routes. (API examples)
     */
    app.get('/auth/foursquare', passport.authorize('foursquare'));
    app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/auth/api' }), (req, res) => {
      res.redirect('/auth/api/foursquare');
    });
    app.get('/auth/tumblr', passport.authorize('tumblr'));
    app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/auth/api' }), (req, res) => {
      res.redirect('/auth/api/tumblr');
    });
    app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
    app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/auth/login' }), (req, res) => {
      res.redirect(req.session.returnTo || '/auth/');
    });
    app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
    app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/auth/login' }), (req, res) => {
      res.redirect('/auth/api/pinterest');
    });
  }
}

module.exports = authroutes