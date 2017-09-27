const csystem = require(__dirname+"/../../apps/csystem/index");
const Config = require(__dirname+'/../../config/config');

class csystemroutes
{
	constructor(app, passport)
	{
		app.get('/', function (req, res) {
			let defaultpage;
			if (!req.isAuthenticated())defaultpage = Config.get("/defaulpageloggedout");
			 else defaultpage = Config.get("/defaulpageloggedin");
			let elements = Config.get("/elements")
		  	csystem.showPage(false, "title",500, defaultpage, req, res, elements, function(err, results){
				return next()
			})
		})
	}
}

module.exports = csystemroutes