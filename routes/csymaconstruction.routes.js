const csystem = require(__dirname+"/../apps/csystem/index");
const Config = require(__dirname+'/csymaconstruction/../config/config');
const csymaconstruction = require(__dirname+"/../apps/csymaconstruction/index");

class csymaconstructionroutes
{
  constructor(app, passport)
  {
    // define the home page route
    app.get('/csymaconstruction/', function (req, res) {                 //load the app here...
      csymaconstruction.init_child(req,res, function(err, results){
          csymaconstruction.settitle("Csyma| Site under construction");
          //other head elements....
          csymaconstruction.setpage("apps/csymaconstruction/csymaconstruction");        //very important
          csymaconstruction.setdescription("site under construction");
          csymaconstruction.setkeywords("site under construction");
          csymaconstruction.getelements(req,res, function(err, results){ })
          
        })
    })
  }
}

module.exports = csymaconstructionroutes