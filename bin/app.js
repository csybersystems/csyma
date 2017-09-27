/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const fse = require('fs-extra');
const Async = require('async');
/**
 *  More Modules.
 */
const csErroHandler = require("../apps/csystem/errors");
const csystem = require("../apps/csystem");

/**
 * Load environment variables from .env file, where API keys and passwords are configured
 */

if (fse.existsSync('.env'))
  dotenv.load({ path: '.env' });
else
  dotenv.load({ path: '.env.example' });

/*
 * familyfe loaded here because it requires some environment variables
 */
// const familyfe = require('node-familyfe')
/**
 * Connect to DB.
 */
// familyfe.connect();


/**
 * Connect to MongoDB.
 */
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('../config/passport');

/**
 * Create Express server.
 */
 const app = express();
/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
/**
 * Load routes from all files in routes dir
 */


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
// log every request to the console
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

// required for passport
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET, 
  store: new MongoStore({       //need to check store...........
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use((req, res, next) => {                           /////////////////////////////.....................check
  if (req.path === '/api/upload') {
    next();
  } else 
  if (req.path === '/auth/password' || req.path === "/auth/profile"  || req.path === "/account/delete" ||
    req.path === "/auth/signupinside" || /*spoc*/req.path === "/auth/unlink/"  || req.path === "/spoc/uploadcsv"  || req.path === "/spoc/uploaddwg" /*spoc*/
    ){
     next();
  }
  else{
   // lusca.csrf()(req, res, next);
   next();
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {                            /////////////////////////////.....................check
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
//app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })); /////////////////////////////.....................check
app.use(express.static('public', { maxAge: 31557600000 }));
app.use(express.static('uploads'));


{
  let routes = {};
  console.log("Loading routes...")

  let routesbase = __dirname+"/../routes"

  Async.auto({
    checkdirs: function(done){
      console.log(routesbase)
      fse.readdir(routesbase, function(err, items){
        done(null, items)
      })
    },
    loaddirs: ["checkdirs", function (results, done) {
      let dirs = [routesbase];
      let items = results.checkdirs
      Async.each(items, function (path, next){ 
        path = routesbase+"/"+path;
        // console.log(`path: ${path}`)
        fse.lstat(path, (err, stats) => {
          if(stats.isDirectory() === true)
          {
              dirs.push(path)
          }
          next();
        })
      }, function(err) {

          done(null, dirs)
      }); 
    }],
    routes:  ["loaddirs", function (results, done) {
      let dirs = results.loaddirs;
      Async.each(dirs, function (dir, next){ 
          fse.readdir(dir, function(err, items){
            for (let i=0; i<items.length; i++) {
            if(items[i] == "." || items[i] == "..")continue;
            let checkjs = items[i].split('.');
            if(checkjs[checkjs.length -1] != 'js')continue;
            let routename = items[i].split(".")[0];
            console.log("%s %s", chalk.green('✓'), routename)
            routes[routename] = dir+"/"+items[i];
          }

              next();
          })
      }, function(err) {

          done()
      }); 
    }],

  }, (err, _results) => {

  })

  /*
   * There is a scope problem if the routes are loaded in async block.
   * So wait here some period load enough for the route files to be pushed to routes, then require them.
   */
  const sleep = require('system-sleep');
  sleep(100); 
  for(let ind in routes)
  {
    // try
    // {
      let route = routes[ind]
      console.log(route)
      new (require(route)) (app, passport)
    // }catch(err){}
  } 
  console.log("EO routes")
}


/**
 * 404
 */
app.route('*')
.get( function(req, res){
  csErroHandler.error404(req, res)
  //res.render('404');
})
.post( function(req, res){
// res.status(404);
  //res.send('what???');
  csErroHandler.error404(req, res)
});

/**
 * Error Handler
 */
app.use(function(err, req, res, next) {
  console.log(err)
  csErroHandler.error500(err, req, res, app.get("env"), function(err){
    next(err);
  });
  
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
