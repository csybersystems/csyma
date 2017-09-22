const express = require('express')
const router = express.Router()
const csystem = require(__dirname+"/../apps/csystem/index");
const Config = require(__dirname+'/../config/config');
const csymaconstruction = require(__dirname+"/../apps/csymaconstruction/index");

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {                 //load the app here...
	csymaconstruction.init_child(req,res, function(err, results){
      csymaconstruction.settitle("Csyma| Site under construction");
      //other head elements....
      csymaconstruction.setpage("apps/csymaconstruction/csymaconstruction");				//very important
      csymaconstruction.setdescription("site under construction");
      csymaconstruction.setkeywords("site under construction");
      csymaconstruction.getelements(req,res, function(err, results){ })
      
    })
})

module.exports = router