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
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const fse = require('fs-extra');

/**
 *  More Modules.
 */
const csErroHandler = require("../apps/csystem/errors");

/**
 * Load environment variables from .env file, where API keys and passwords are configured
 */

if (fse.existsSync('.env'))
  dotenv.load({ path: '.env' });
else
  dotenv.load({ path: '.env.example' });
/**
 * Connect to MongoDB.
 */
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
console.log("views<"+path.join(__dirname, 'views'))
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
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
/**
 * Load routes from all files in routes dir
 */
{
  let routes = {};
  let items = fse.readdirSync("./routes");
  for (let i=0; i<items.length; i++) {
    //console.log(items[i])
    if(items[i] == "." || items[i] == "..")continue;
    let checkjs = items[i].split('.');
    console.log(checkjs);
    if(checkjs[checkjs.length -1] != 'js')continue;
    let routename = items[i].split(".")[0];
    routes[routename] = items[i];
  }

  for(let route in routes)
    if(route == 'csystem')app.use('/', require("../routes/"+routes[route]))
    else app.use('/'+route, require("../routes/"+routes[route]))

  for(let route in routes)console.log("route: "+'/'+route)
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
