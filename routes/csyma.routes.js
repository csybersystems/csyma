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
router.get('/', function (req, res) {
		res.send('is csyma endpoints')
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