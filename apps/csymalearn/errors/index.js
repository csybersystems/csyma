const Config = require('../../../config/config');
const csystem = require("../index");
const path = require('path');
const Async = require('async');

class errohandler extends csystem
{

	static error404(req, res)
	{
		//this.init(req, res);
		let headless = req.query.headless || false;
		console.log(headless)
		if (! req.accepts('html')) {    //if (req.accepts('json'))
	      res.status(404).send({ error: 'Not found', code: '404' });
	      return;
	    }
	    //throw new Error( )

	    this.showPage(headless, "404",404, "apps/csystem/errors/404", req, res, function(err, results){
					return next()
				})
	    
		return;
	}

	static error500(err, req, res, env, next)
	{
		console.log(err)
		let headless = req.query.headless || false;
		if(env === 'developmente')
		{
			if (! req.accepts('html')) {    //if (req.accepts('json'))
				try
				{
					res.status(err.status || 500).send({ error: err.message, code:err.status || 500 });
				}catch(error)
				{
					res.send({ error: err, code:err.status || 500 });
				}
				return next();
			}
			this.showPage(headless, "500",err.status || 500, "apps/csystem/errors/500", req, res, function(err, results){
					return next()
				})
			
			return next();


		}
		else
		{
			
			if (! req.accepts('html')) {    //if (req.accepts('json'))
				try
				{
					res.status(err.status || 500).send({ error: err.message, code:err.status || 500 });
				}catch(error)
				{
					res.send({ error: err.message, code:err.status || 500 });
				}
				return next();
			}
			this.showPage(headless, "500",err.status || 500, "apps/csystem/errors/500", req, res, function(err, results){
					return next()
				})
		}

	}



	static showPage(headless, title, status, page, req, res){
		let self = this;
		this.init(req, res, function(err){

		let user = JSON.parse(JSON.stringify(self.user));
		var name = user.name.first + ' ' + user.name.middle + ' ' + user.name.last;
		user.name = name;
		let appstoload = {}
		let apptoloadtest = []
		self.setapp("csystem")
		self.setreq(req)
		  
		  
		  Async.auto({
		      loadconfig: function (done) {
		        self.loadconfig(function(err, _results){
		          done(err);
		        });
		      },
		      whoami: ['loadconfig', function (_results, done) {
		        self.whoami(function(err, _results){
		          done(err);
		        });
		      }],
		      checkenabled:["whoami", function(_results, done){
		        let tmpstack = []
		        for(let index in user.apps)
		           for(let app in user.apps[index])
		            {
		              tmpstack.push(app)
		              break;
		            }

		        
		        //order...
		        let tmpapp;
		        while(tmpapp = tmpstack.pop())apptoloadtest.push(tmpapp)

		        while(tmpapp = apptoloadtest.pop()){

		          let tmpi = csyber.appisEnabled(tmpapp)
		          if(tmpi !== false && tmpi != undefined)
		          {
		            let myconfig = require('../apps/'+tmpapp+'/config/config.js'); 
		            let appdata = myconfig.get("/"); 
		              appstoload[tmpapp] = {};
		              appstoload[tmpapp]["name"] = appdata["name"];
		              appstoload[tmpapp]["url"] = appdata["url"];
		          }

		        }
		        done();

		      }]
		  }, (err, _results) => {
		      if (err);
		      console.log("appstoload")
		      console.log(appstoload)

		      let sidemenuitems = Config.get('/sidemenuitems');
			  sidemenuitems.apps.apps = appstoload;
			  let tmp;
			  for( tmp in sidemenuitems.apps.apps)if(sidemenuitems.apps.apps[tmp]['default'] === false)delete sidemenuitems.apps.apps[tmp]
			  for( tmp in sidemenuitems.others)if(sidemenuitems.others[tmp]['default'] === false)delete sidemenuitems.others[tmp]
			    for( tmp in sidemenuitems.dashboards.dashboards)if(sidemenuitems.dashboards.dashboards[tmp]['application'] != "home")delete sidemenuitems.dashboards.dashboards[tmp]
			  let apps = {}
			  console.log(sidemenuitems.apps.apps)
			  console.log(user.profile)
			  
			  res.render(page, {
			    title: title,
			    application: 'Application',
			    company: Config.get('/company'),
			    companyurl: Config.get('/companyurl'),
			    appname:Config.get('/appname'),
			    displayappname:Config.get('/displayappname'),
			    year:Config.get('/year'),
			    applogoname:Config.get('/applogoname'),
			    applogoref:Config.get('/applogoref'),
			    version:Config.get('/version'),
			    rooturl:Config.get('/rooturl'),
			    skin:Config.get('/skin/siteuser'),
			    section:title,
			    teamname:Config.get('/teamname'),
			    sidemenuitems:sidemenuitems,
			    apps:apps,
			    user:user,
			    less:headless,
			    rooturl:Config.get('/rooturl'),
			    adminemail:Config.get('/adminemail'),
			  });
			});
		  });
		  
		  
		
	}
}

module.exports = errohandler