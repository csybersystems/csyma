const User = require(__dirname+'/models/User')
const csyberUser = require('./models/csyberuser');
const Config = require(__dirname+'/../../config/config');
const Async = require('async');

class csystem extends csyberUser
{
	static init(req,res, done)
	{

		let self = this;
		if(!req.user)
		{
			//console.log("is collection")
			//console.log(self.collection)
			self.collection = "users"
			self.findOne({email:Config.get("/guestemail")}, function(err, docs){
				self.user = docs;	//Assume to error
				done();
			})
		}
		else
		{
			self.user = req.user.toObject();
			done();
		}
	}

	static setapp(app){
		this.app = app
	}

	static setreq(req){
		this.req = req
	}

	static loadconfig(callback){
		
		let self = this;
		let path = "../"+self.app+"/config/config.js";
		Async.auto({
            start: function (dones) {
            	
				try
				{
					self.config = require(path);
					dones(null, true);
				}catch(err){

					//console.log(err)
					throw new error(err)
					//dones(err)
				}
            },
            csyberconfig: ["start",function (results, dones) {
            	

            	
				try
				{
					// let path = "../"+"csystem"+"/config/config.js";
     //        	console.log("is path  "+path)
					// console.log("///in here,,,,,,,,,,")
					// console.log("is path  "+path)
					self.csyberconfig = require(path);
            		// path = "../"+self.app+"/config/config.js";
					dones();
				}catch(err){
					//self.send(err)
					dones(err)
				}
            }]
            
        }, (err, _results) => {
            if (err);
            callback(err);
        });
	}
	static whoami(done){
		let self = this;
		Async.auto({
            start: function (dones) {
            	try{
		            let path = "../"+self.app+"/config/config.js";
					let user = self.user;
					//get his apps
					let collection = self.collection;
					self.collection = "apps";
					csyberUser.getusersapps(user._id, function(err, apps){
						//let apps = JSON.parse(JSON.stringify(user.apps));
						// // console.log("////whoami")
						// // console.log("apps")
						// // console.log(apps)
						var mygroup = {}
						let ind = 0;
						for(let index in apps)
						    for(let app in apps[index])
					    	{
						    	mygroup[app] = {}
						    	//if(app == self.app)
						      		for(let ca in apps[index][app])mygroup[app][ind++] = apps[index][app][ca]["name"];
						    }
						
						// console.log("apps")
						// console.log(mygroup)
						if(ind == 0)mygroup[0] = {"name":"nobody"};
						self.mygroups = mygroup;
						dones(null, mygroup)
					})
					

				}catch(err){
					self.send(err)
					dones(err)
				}
			}
        }, (err, _results) => {
            if (err) ;
            // console.log("////whoamino er")
            done(err);
        });
		/**/
	}

	static appisEnabled(app, installing, url)			//in user.apps and is enabled
	{
		/*const appsConfig = require('../installedapps');
		let installedapps = appsConfig.get("/");
		let uninstalledapp = [];
		let appEnabled = false;
		return installedapps[app].enabled || false;
		*/
		let enabled = false;
		//// console.log(this.mygroups)
		try
		{
			let config = require(__dirname+'/../'+app+'/config/config.js');
			let groups = []
			let test;
			if(installing === true)
			{
				test = config.get("/enabled/"+"nobody");
				if(false !==  test && undefined != test)enabled = test;
			}
			for(let i in this.mygroups[app])groups.push(this.mygroups[app][i])

			while(groups.length > 0)
			{
				let tmp = groups.pop();
				test = config.get("/enabled/"+tmp)
				if(false !==  test && undefined != test)enabled = test;
			}
			if(enabled !== false && url === true)enabled = config.get("/url")
			
		}catch(err)
		{
			//// console.log(err);
			return false;
		}
		return enabled;
	}

	static showPage(iheadless, title, status, ipage, req, res, elements){

		let self = this;
		this.init(req, res, function(err){

		let user = JSON.parse(JSON.stringify(self.user));
		var name = user.name.first + ' ' + user.name.middle + ' ' + user.name.last;
		user.name = name;
		let appstoload = {}
		let apptoloadtest = []

		let headless = self.headless||iheadless
		//
		if(! self.app)self.setapp("csystem")
		self.setreq(req)
		  
		  Async.auto({
		      loadconfig: function (done) {
		        self.loadconfig(function(err, _results){
		          done(err);
		        });
		      },
		      whoami: ['loadconfig', function (_results, done) {
		        self.whoami(function(err, _results){
		        	// console.log("EO whomi")
		        	// console.log("showing page...")
		          done(err, _results);
		        });
		      }],
		      checkenabled:["whoami", function(_results, done){
		      	// console.log("are groups")
		      	// console.log(self.mygroups)
		        let tmpstack = []
		        for(let index in self.mygroups)
		        {
		        	// // console.log(index)
		         //   for(let app in self.mygroups[index])
		         //    {
		         //      tmpstack.push(app)
		         //      break;
		         //    }
		         	tmpstack.push(index)
		        }
		        // console.log(tmpstack)
		        //order...
		        let tmpapp;
		        while(tmpapp = tmpstack.pop())apptoloadtest.push(tmpapp)
		        	// console.log(apptoloadtest)
		        	// console.log("tmpapp")
		        while(tmpapp = apptoloadtest.pop()){
		         // console.log(tmpapp)
		          let tmpi = self.appisEnabled(tmpapp)
		          // console.log(tmpi)
		          if(tmpi !== false && tmpi != undefined)
		          {
		            let myconfig = require(__dirname+'/../'+tmpapp+'/config/config.js'); 
		            let appdata = myconfig.get("/");
		              appstoload[tmpapp] = {};
		              appstoload[tmpapp]["name"] = appdata["name"];
		              appstoload[tmpapp]["url"] = appdata["url"];
		              appstoload[tmpapp]["urloriginal"] = appdata["url"].split("#").join("/");
		              appstoload[tmpapp]["displayname"] = appdata["displayname"];
		              
		          }

		        }
		        done(); 

		      }]
		  }, (err, _results) => {
		      if (err);
		      // console.log("appstoload")
		      // console.log(appstoload)

		      let sidemenuitems = {}// Config.get('/sidemenuitems');
		      sidemenuitems.apps = {}
			  sidemenuitems.apps.apps = appstoload;
			  let tmp;
			  for( tmp in sidemenuitems.apps.apps)if(sidemenuitems.apps.apps[tmp]['default'] === false)delete sidemenuitems.apps.apps[tmp]
			  // for( tmp in sidemenuitems.others)if(sidemenuitems.others[tmp]['default'] === false)delete sidemenuitems.others[tmp]
			  //   for( tmp in sidemenuitems.dashboards.dashboards)if(sidemenuitems.dashboards.dashboards[tmp]['application'] != "home")delete sidemenuitems.dashboards.dashboards[tmp]
			  let apps = {}
			  // console.log(sidemenuitems.apps.apps)
			  // console.log(user.profile)
			  
			 // console.log("are paps")
			 // console.log("is root url..")
			 elements = self.getdashboards(elements)
			 elements = self.getothersideelemitems(elements)
			 console.log(elements)
			 // console.log(Config.get('/rooturl'))
			  res.render(self.page||ipage, {
			    title: self.title||title,
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
			    builder:Config.get('/builder'),
			    author:Config.get('/author'),
			    elements:elements
			  });
			});
		  });
		  
		  
		
	}

	static getelements(req, res, callback){
		
		let self = this;
		
		let accepts;
		if(req.query.accepts!==undefined)
				accepts = req.query.accepts;
				else accepts = false;
		Async.auto({

            start: function (dones) {
            	let config = require(__dirname+"/../"+self.app+"/config/config")
            	let elements = config.get("/elements")
            	// console.log(elements)

            	if(accepts !== false)
            	{
            		// console.log("is accept..."+accepts)
            		switch(accepts)
            		{
            			case "json":
            				self.showjsonpage(elements, res)						//for JSON
            				break;
            			default:
            				res.send("non Json data")											//for html
            			;
            		}
            	}else{
            		if(!req.accepts("html"))
            		{
            			self.showjsonpage(elements, res)									//for JSON
            		}
            		else
            		{
            			self.showhtmlpage(elements, config, req, res)																			//for html
            		}
            	}
            	dones(null, "these are the results")
            }
            
        }, (err, _results) => {
            if (err);
            callback(err, _results.start);
        });
	}

	static showjsonpage(elements, res)
	{
		res.send(JSON.stringify(elements))
		//headless, title, status, page, req, res, elements
	}

	static showhtmlpage(elements, config, req,res)
	{
		//res.send(JSON.stringify(elements))
		let self = this
		let headless = req.query.headless || false;
		let title = this.pagetitle;
		elements.meta = this.pagemeta;
		let status = 200;
		this.showPage(headless, title, status, elements.defaultpage, req, res, elements)
		//headless, title, status, page, req, res, elements
	}

	static settitle(title)
	{
		this.title = title;
	}
	static setpage(page)
	{
		this.page = page;
	}

	static setmeta(meta)
	{
		this.meta = meta;
	}

	static setheadless(headless)
	{
		this.headless = headless;
	}

	static getothersideelemitems(elements)
	{
		let self = this
		let others = self.config.get("/elements/others")
		console.log(others)
		elements.others = others
		return elements;

	}
	static getdashboards(elements)
	{
		let self = this;
		let path = "../"+self.app+"/config/config.js";
		self.config = require(path);
		var dashboards = {}
		let i = 0;
		for(let index in self.mygroups[self.app])
		{
			let group = self.mygroups[self.app][index];
			let tmp = self.config.get("/elements/dashboards/"+group)
			//console.log(tmp)
			//console.log(self.mygroups)
			//console.log("has temp")
			tmp == undefined?dashboards[i++] = {}:dashboards[i++] = tmp;
		}
		let alldashboards = {dashboards:{dashboards:{}}};
		for(i in dashboards)
		{
			if(dashboards[i].dashboards == undefined)continue;

			if(dashboards[i].dashboards.class != undefined)
				alldashboards.dashboards.class = dashboards[i].dashboards.class
			for(let j in dashboards[i].dashboards.dashboards)
			{
				alldashboards.dashboards.dashboards[j] = dashboards[i].dashboards.dashboards[j]
			}

			//console.log(dashboards[i])
			/**/
		}
		//dashboards[0] != undefined?dashboards = dashboards[0]:false;
		dashboards = alldashboards;
		//console.log(dashboards)
		elements.dashboards = dashboards.dashboards
		return elements;
	}
}

module.exports = csystem