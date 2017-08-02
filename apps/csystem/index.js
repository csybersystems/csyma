const User = require(__dirname+'/models/User')
const csyberUser = require('./models/csyberuser');
const Config = require(__dirname+'/../../config/config');
const Async = require('async');

class csystem extends csyberUser
{

	static init(req,res, done)
	{

		let self = this;

		self.sections = false;
		if(self.app === undefined)self.app = "csystem";
		self.isguest = req.isAuthenticated() === true? false:1;
		if (req.isUnauthenticated()) 
		{
			//console.log("is collection")
			//console.log(self.collection)
			self.collection = "users"
			self.findOne({email:Config.get("/guestemail")}, function(err, docs){
				self.user = docs;	//Assume to error
				Async.auto({
			      loadconfig: function (dones) {
			        self.loadconfig(function(err, _results){
			          dones(err);
			        });
			      },
			      whoami: ['loadconfig', function (_results, dones) {
			        self.whoami(function(err, _results){
			          dones(err, _results);
			        });
			      }]
			 	}, (err, _results) => {done();})
					
				})
		}
		else
		{
			self.user = req.user.toObject();
			Async.auto({
			      loadconfig: function (dones) {
			        self.loadconfig(function(err, _results){
			          dones(err);
			        });
			      },
			      whoami: ['loadconfig', function (_results, dones) {
			        self.whoami(function(err, _results){
			          dones(err, _results);
			        });
			      }]
			 	}, (err, _results) => {done();})
					
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
					throw new Error(err)
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
						try
						{
							dones(null, mygroup)
						}catch(err){}
					})
					

				}catch(err){
					self.send(err)
					try
					{
						dones(err)
					}catch(err){}
					
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
		var name;
		try
		{
			name = user.name.first + ' ' + user.name.middle + ' ' + user.name.last;
		}catch(error){}
		
		user.names = user.name;
		user.name = name || "";
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
		              appstoload[tmpapp]["class"] = appdata["class"];
		              appstoload[tmpapp]["urloriginal"] = appdata["url"].split("#").join("/");
		              appstoload[tmpapp]["displayname"] = appdata["displayname"];
		             // class_a = appdata["sidemenuitems"]["apps"]["class"];
		              
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
			  sidemenuitems.apps.class = "fa fa-pencil fa-fw";

			  let tmp;
			  for( tmp in sidemenuitems.apps.apps)if(sidemenuitems.apps.apps[tmp]['default'] === false)delete sidemenuitems.apps.apps[tmp]
			  // for( tmp in sidemenuitems.others)if(sidemenuitems.others[tmp]['default'] === false)delete sidemenuitems.others[tmp]
			  //   for( tmp in sidemenuitems.dashboards.dashboards)if(sidemenuitems.dashboards.dashboards[tmp]['application'] != "home")delete sidemenuitems.dashboards.dashboards[tmp]
			  let apps = {}
			  // console.log(sidemenuitems.apps.apps)
			  // console.log(user.profile)
			  
			 // console.log("are paps")
			 // console.log("is root url..")
			 // elements = self.getdashboards(elements)
			 elements = self.setelements(elements);
			 // console.log("page elements")
			 // console.log(elements)
			 // console.log(Config.get('/rooturl'))
			 console.log("page................................")
			 console.log(self.page)
			 console.log(ipage)
			  res.render(self.page||ipage, {
			    title: self.title||title,
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
			    application: elements.app||Config.get("/name"),
			    section:elements.section||"home",
			    subsection: elements.subsection || "index",
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
	static setelements(elements)
	{
		try
		{
			let self = this;
			// console.log("elements...")
			let config = require(__dirname+"/../"+self.app+"/config/config")
			// console.log("config path: "+__dirname+"/../"+self.app+"/config/config")
	    	// if(JSON.stringify(elements).length == 2)				//empty object
	    	if(elements === false)
	    	{
	    		elements = config.get("/elements")
	    	}
	    	console.log("testing situation....")
	    	console.log(self.sections)
	    	console.log("tested situation....")
	    	if(!self.sections || self.sections === false)
			{
				console.log("met condition")
				console.log(elements)
				delete elements.csections
				console.log(elements)
			}
	    	elements.meta = self.pagemeta;
	    	elements = self.getdashboards(elements)
	    	elements = self.getothersideelemitems(elements)
	    	if(self.section !== undefined)elements.section = self.section
	    	if(self.subsection !== undefined)elements.subsection = self.subsection
	    	if(self.app !== undefined)elements.app = self.app
	    	if(self.isguest !== undefined)elements.isguest = self.isguest
	    	// console.log("are elements")
	    	// console.log(elements)
	    	return elements
	    }catch(error)
	    {
	    	if(elements === false) return {}
	    	return elements
	    }
	}



	static getelements(req, res, callback){
		let self = this;
		
		let accepts;
		if(req.query.accepts!==undefined)
				accepts = req.query.accepts;
				else accepts = false;
		let config = require(__dirname+"/../"+self.app+"/config/config")
		let elements = self.setelements(false)
		Async.auto({

            start: function (dones) {
            	

            	if(accepts !== false)
            	{
            		// console.log("is accept..."+accepts)
            		switch(accepts)
            		{
            			case "json":
            				self.showjsonpage(elements, res)						//for JSON
            				break;
            			default:
            				self.showhtmlpage(elements, config, req, res)				//for html
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

	static setdescription(description)
	{
		this.description = description;
	}

	static setkeywords(keywords)
	{
		this.keywords = keywords;
	}

	static setheadless(headless)
	{
		this.headless = headless;
	}

	static setsections(sections)
	{
		this.sections = sections;
	}

	static getothersideelemitems(elements)
	{
		let self = this
		let others = {}
		let path = "../"+self.app+"/config/config.js";
		self.config = require(path);

		// console.log(others)
		let i = 0;
		let sections;
		(this.sections!=undefined && this.sections !== false)?sections="/"+this.sections:sections="";
		if(sections !== "")
		{
			for(let index in self.mygroups[self.app])
			{
				let group = self.mygroups[self.app][index];
				let tmp = self.config.get("/elements/csections/"+group+sections)
				tmp == undefined?others[i++] = {}:others[i++] = tmp;
				self.page = self.config.get("/elements/csections/"+group+sections+"/defaultpage") || self.page;
			}
		}else
		{
			for(let index in self.mygroups[self.app])
			{
				let group = self.mygroups[self.app][index];
				let tmp = self.config.get("/elements/others/"+group)
				tmp == undefined?others[i++] = {}:others[i++] = tmp;

			}
		}
		

		let sendothers = {};
		let j;

		let ii
		let tmp = others;
		for(ii in tmp)
		{
			others = tmp[ii];
			for(i in others)
			{	
				if(others[i].name === undefined)continue;
				if(sendothers[others[i].name] === undefined)sendothers[others[i].name] = others[i]
				else
				{
					j = sendothers[others[i].name].length;
					try
					{
						if(sendothers[others[i].name].children === undefined)sendothers[others[i].name].children = {}
						sendothers[others[i].name].children = Object.assign(others[i].children, sendothers[others[i].name].children)
					}catch(error)
					{
						sendothers[others[i].name] = Object.assign(others[i], sendothers[others[i].name])
					}
				}
			}
		}

		elements.others = sendothers
		try
		{
			elements.title = self.title || self.app;
			elements.description = self.description ||elements.description;
			elements.keywords = self.keywords ||elements.keywords;
		}
		catch(error){}
		return elements;

	}
	static getdashboards(elements)
	{
		/*
		 * everything below is still just kept here to keep the system from breaking. See how to remove it
		 */
		// return elements;	//everything below is only left for historical purposes.
		let self = this;
		let path = "../"+self.app+"/config/config.js";
		self.config = require(path);
		var dashboards = {}
		let i = 0;
		for(let index in self.mygroups[self.app])
		{
			let group = self.mygroups[self.app][index];
			let tmp = self.config.get("/elements/dashboards/"+group)
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
		}
		dashboards = alldashboards;
		elements.dashboards = dashboards.dashboards
		return elements;
	}
}



module.exports = csystem