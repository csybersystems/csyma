const express = require('express')
const router = express.Router()
const csystem = require(__dirname+"/../apps/csystem/index");
const Config = require(__dirname+'/../config/config');
const csyma = require(__dirname+"/../apps/csyma/index");

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {                 //load the app here...
    csyma.init_child(req,res, function(err, results){
      csyma.settitle("page titled");
      csyma.setpage(false);//clear selection if any
      csyma.getelements(req,res, function(err, results){ })
      
    })
})


router.get('/page/:app/:page', function (req, res) {                 //loading static pages...
    const app = require(__dirname+"/../apps/"+req.params.app+"/index");
    app.init_child(req,res, function(err, results){
      app.settitle(req.params.page);
      // app.setdescription("site under construction");
      // app.setkeywords("site under construction");
      app.setpage("apps/"+req.params.app+"/"+req.params.page);
      // app.setpage("apps/csyma/csyma_about");
      // app.setpage("apps/csyma/csyma_about_splash");
      // app.setpage("apps/csyma/csyma_home");
      // app.setpage("apps/csystem/welcome");
      // app.setpage("apps/csyma/welcome");
      //app.setpage(false);
      app.getelements(req,res, function(err, results){ })
      
    })
})

router.get('/section/:app/:section', function (req, res) {                 //loading sections...
    const app = require(__dirname+"/../apps/"+req.params.app+"/index");
		app.init_child(req,res, function(err, results){
      app.settitle(req.params.section);
      // app.setdescription("site under construction");
      // app.setkeywords("site under construction");
      //app.setpage("apps/"+req.params.app+"/"+req.params.section);
      app.setpage(false);
      app.setsections(req.params.section);
      app.getelements(req,res, function(err, results){ })
      //each section has its own stuff, more like when loading an app...
      
    })
})

// define the about route
router.get('/about', function (req, res) {
  res.send('About birds')
})

router.get('/app/:action', function (req, res) {
  // console.log(req.params)
  //
  //csyma.init_child()
  csyma.init_child(req,res, function(err, results){
  		csyma.settitle("page titled");
  		//other head elements....
  		csyma.setmeta("this is teh meta data");
  		csyma.getelements(req,res, function(err, results){
  		// console.log(results)
  		
  })
  		
  })
  //
  
})

router.get('/app/:appname/:action', function (req, res) {
  console.log(req.params)
  res.send('got params')
})

module.exports = router