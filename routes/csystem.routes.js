const express = require('express')
const router = express.Router()
const csystem = require(__dirname+"/../apps/csystem/index");
const Config = require(__dirname+'/../config/config');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
	let defaultpage;
	if (!req.isAuthenticated())defaultpage = Config.get("/defaulpageloggedout");
	 else defaultpage = Config.get("/defaulpageloggedin");
	let elements = Config.get("/elements")
	//elements.defaultapp = Config.get("/defaultapp") || false;
  	csystem.showPage(false, "title",500, defaultpage, req, res, elements, function(err, results){
		return next()
	})
		//res.send('Home page..')
})

// define the about route
router.get('/about', function (req, res) {
  res.send('About birds')
})

module.exports = router