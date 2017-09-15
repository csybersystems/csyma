const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const csyberUser = require('../models/csyberuser');
const Config = require(__dirname+'/../config/config');
const GConfig = require(__dirname+'/../../../config/config');
var mongoose = require('mongoose');
const Async = require('async');
const Bcrypt = require('bcrypt');


mongoose.Promise = global.Promise;
/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('account/login', {
    title: 'Login',
    company: Config.get('/company'),
    companyurl: Config.get('/companyurl'),
    appname:Config.get('/appname'),
    displayappname:Config.get('/displayappname'),
    year:Config.get('/year'),
    description:Config.get('/description'),
    author:Config.get('/author'),
    authorurl:Config.get('/authorurl'),
    appwebsite:Config.get('/appwebsite'),
    applogoref:Config.get('/applogoref'),
  });
};

exports.getLoginOld = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/loginlocal', {
    title: 'Login',
    company: Config.get('/company'),
    companyurl: Config.get('/companyurl'),
    appname:Config.get('/appname'),
    displayappname:Config.get('/displayappname'),
    year:Config.get('/year')
  });
};

exports.getAuth = (req, res) => {
  if (req.query.output != 'html') {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify(Config.get('/endpoints/auth'))
      );
  }
  else 
  res.send("...");
};

exports.getEndpoints = (req, res) => {
  if (req.query.output != 'html') {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify(Config.get('/endpoints'))
      );
  }
  else 
  res.send("...");
};

exports.getOtherEndpoints = (req, res, which)=>{
  if (req.query.output != 'html') {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify(Config.get('/endpoints'+which))
      );
  }
}

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/auth/loginlocal');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/auth/loginlocal');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

exports.postSignininside = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    let errcount;
    let errmsg = "";
    for(errcount in errors)
      errmsg += errors[errcount].msg+", "
      ////console.log(errors[errcount])
    res.send({"err":errmsg});
     // next(errors);
     return next();
  }

  const user = new User({
    email: req.query.email,
    password: req.query.password,
    isActive:true,
  });
  passport.authenticate('local', (err, user, info) => {

    if (err) { 
      res.send({"err":'Unable to log in. Maybe account has no password?'});
      return next(err); 
    }
    if (!user) {
      res.send({"err":info.msg});
     return next();
    }

    req.logIn(user, (err) => {
      if (err) { 
        res.send({"err":err});
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.send({"msg":'Success! You are logged in.' ,"redirect":GConfig.get("/rooturl")});
      return next();
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect(GConfig.get("/rooturl"));
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account',
    company: Config.get('/company'),
    companyurl: Config.get('/companyurl'),
    appname:Config.get('/appname'),
    displayappname:Config.get('/displayappname'),
    year:Config.get('/year')
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/auth/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/auth/signup');
    }
    const username = req.body.email;
    const password = req.body.password;
    const email = req.body.password;

    const MongoModels = require('mongo-models');

    Async.auto({
    create:  (done) => {
        csyberUser.create(username, password, email,  function(err, result){done(err, result) });
    },
    installapps: ['create', (results, done) => { 
      const id = results.create._id;
      csyberUser.installallapps(id, "free",done) 
    }],
   }, (err, results) => {

    if (err) { return next(err); }
      req.logIn(user, {session: false},(err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', { msg: 'Success! Your account has been created. You can now log in' });
        res.redirect('/');
      });
  });

  });
};


exports.postSignupinside = (req, res, next) => {
  let accountType = req.params.type === "organization"? "organization":"user";
  let owner; //current user.
  try
  {
    owner = req.user.id.toString();
    console.log(req.user)
    console.log(owner)
  }catch(error)
  {
    owner = "csystem";
  }
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.query.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    //req.flash('errors', errors);
    //return res.redirect('/auth/signup');
    let errcount;
    let errmsg = "";
    for(errcount in errors)
      errmsg += errors[errcount].msg+", "
      ////console.log(errors[errcount])
    res.send({"err":errmsg});
     // next(errors);
     return next();
  }

  const user = new User({
    email: req.query.email,
    password: req.query.password
  });

  User.findOne({ email: req.query.email }, (err, existingUser) => {
    if (err) { 
      res.send({"err":""+err});
      return next();
     }
    if (existingUser) {
      res.send({"err":"Account with that email address already exists."});
      return next(err);
    }
    const username = req.query.email;
    const password = req.query.password;
    const email = req.query.email;

    const MongoModels = require('mongo-models');

    Async.auto({
    create:  (done) => {
        csyberUser.setaccountType(accountType);
        csyberUser.setowner(owner);
        csyberUser.create(username, password, email,  function(err, result){done(err, result) });
    },
    installapps: ['create', (results, done) => { 
      const id = results.create._id
      console.log("will install apps for this user......"+id)
      csyberUser.installallapps(id, "free",done) 
    }],
   }, (err, results) => {

    if (err) { 
      try{
        res.send({"err":""+err});
        //console.log("test point")
        return next();
      }catch(error){
        return next()
      }

    }
      req.logIn(user, {session: false},(err) => {
        //assume no error
        if (err) {
         // res.send({"err":""+err});
         // return next(err);
        }
        res.send({"msg":"Account has been created"});
        return next();
      });
  });

  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  /*(req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }
  */

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    //user.email = req.user.email || '';
   // user.profile.name = req.body.name || '';
    user.profile.gender = req.query.gender || req.user.gender || '';
    user.gender = req.query.gender || req.user.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.name = {
      first: req.query.fname || '', 
        middle:req.query.mname || '',  
        last: req.query.lname || '', 
        other:req.query.oname || ''
    };
    user.locale = req.query.lang || '';
    user.save((err) => {
      if (err) {
        res.send(JSON.stringify({"err":"Error changing profile. Please try again."}))
      }else
      {

        res.send(JSON.stringify({"msg":"Profile successfully changed"}))
      }
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, callback) => {

  if (!req.isAuthenticated()) {
    res.send(JSON.stringify({"err":"Your are not logged in.","redirect":GConfig.get("/rooturl")+GConfig.get("/urls/login")}))

    return res.redirect(GConfig.get("/rooturl")+GConfig.get("/urls/login"));
  }
  csyberUser.changepwd(req, res,  callback);
  

};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { 
      res.send(JSON.stringify({"err":"Problems experienced deleting you account. Please try again"}))
    }
    req.logout();
   // req.flash('info', { msg: 'Your account has been deleted.' });
   // res.redirect('/');
   res.send(JSON.stringify({"msg":"Your account had been deleted"}))
  });
};


exports.postDeleteAccountInside = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { 
      res.send(JSON.stringify({"err":"Problems experienced deleting you account. Please try again"}))
    }
    req.logout();
   res.send(JSON.stringify({"msg":"Sad to see you go. Your account had been deleted.","redirect":GConfig.get("/rooturl")+GConfig.get("/urls/left")}))
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Your Hackathon Starter password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });    
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password',
    company: Config.get('/company'),
    companyurl: Config.get('/companyurl'),
    appname:Config.get('/appname'),
    displayappname:Config.get('/displayappname'),
    year:Config.get('/year')
  });
};

exports.postUnlink = (req, res, dones) => {
  try
  {

    let account = req.params.account;
    if(account == undefined)throw new Error("Please send us the account to unlink in your query")
    else{       //why does this else have to be here after throw(ing). Breaks without it.
      let user = JSON.parse(JSON.stringify(req.user))
      if(user[account] == undefined|| user[account] == '')throw new Error("You don't have a linked "+account+" account")
      delete user[account]
      // const User = require('../../models/User');
      User.findById(req.user.id, (err, inneruser) => {
        if (err){
            res.send({"err":"Problem unlinking account"});
            dones("Problem unlinking account")
        }
          
          inneruser[account] = "";
          inneruser.save((err) => {
            if (err){
                res.send({"err":"Problem unlinking account"});
                dones("Problem unlinking account")
            }else
            {
                res.send({"msg":"Your "+account+" acount has been removed"});
                dones();

            }

        //self._result = 11;
        
          });
        // dones();
         
        });
    }
  }catch(error)
  {
    res.send({"err":""+error});
    dones();
  }
}

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/auth/reset');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Reset your password on Hackathon Starter',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        https://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/auth/reset'))
    .catch(next);
};