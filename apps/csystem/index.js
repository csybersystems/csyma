const User = require(__dirname+'/models/User')
const csyberUser = require('./models/csyberuser');
const Config = require(__dirname+'/../../config/config');
const Async = require('async');
const  Objlen = require('object-length');
const chalk = require('chalk');

class csystem extends csyberUser
{

	static init(req,res, done)
	{

		let self = this;
		// self.Usermod = User;
		self.sections = false;
		self.csubsection = false;
		if(self.app === undefined)self.app = "csystem";
		self.isguest = req.isAuthenticated() === true? false:1;
		if (req.isUnauthenticated()) 
		{
			////console.log("is collection")
			////console.log(self.collection)
			self.collection = "users"
			self.findOne({email:Config.get("/guestemail")}, function(err, docs){
				console.log(docs)
				self.user = docs;	//Assume to error
				console.log("using guest user...")
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

	static compile(whichapp,callback)
	{
		let self = this;
		let fse = require('fs-extra');
		let appdirs = []

		let rootpath = __dirname+"/../../"
		let appsrootpath = rootpath+"apps/"
		if(whichapp === "all")
		{
			appdirs = fse.readdirSync(appsrootpath);
		}
		else
		{
			appdirs.push(whichapp)
		}

		Async.auto({
	      views: function (done) {
	      	Async.each(appdirs, function (app, next){ 
	      		console.log("Installing "+chalk.green(app))
	      		let src = appsrootpath+app+"/views/"
	      		let dest = rootpath+'views/'+app+"/"
	      		fse.copy(src, dest, function(err){
	      			if(err)
	      			{
	      				// console.log("unable to copy: "+ src+" to "+dest)
	      				// console.log(" "+err)
	      			}
	      			next();
	      		})
	      	}, function(err) {
	      		//assume error
           		done()
        	}); 
	      },
	      routes:  function (done) {
	      	Async.each(appdirs, function (app, next){ 
	      		let src = appsrootpath+app+"/routes/"
	      		let dest = rootpath+'routes/'+app+"/"
	      		fse.copy(src, dest, function(err){
	      			if(err)
	      			{
	      				// console.log("unable to copy: "+ src+" to "+dest)
	      				// console.log(" "+err)
	      			}
	      			next();
	      		})
	      	}, function(err) {
           		done()
        	}); 
	      },
	      public:  function (done) {
	      	Async.each(appdirs, function (app, next){ 
	      		let src = appsrootpath+app+"/public/"
	      		let dest = rootpath+'public/apps/'+app+"/" //leave it as is to avoid conflicts with /${app}
	      		fse.copy(src, dest, function(err){
	      			if(err)
	      			{
	      				// console.log("unable to copy: "+ src+" to "+dest)
	      				// console.log(" "+err)
	      			}
	      			next();
	      		})
	      	}, function(err) {

           		done()
        	}); 
	      },
		config:  function (done) {
	      	Async.each(appdirs, function (app, next){ 
	      		let src = appsrootpath+app+"/config/"
	      		let dest = rootpath+'config/'+app+"/" //leave it as is to avoid conflicts with /${app}
	      		fse.copy(src, dest, function(err){
	      			if(err)
	      			{
	      				// console.log("unable to copy: "+ src+" to "+dest)
	      				// console.log(" "+err)
	      			}
	      			next();
	      		})
	      	}, function(err) {

           		done()
        	}); 
	      },

	 	}, (err, _results) => {
	 		callback();
	 	})
		
	}

	static setapp(app){
		this.app = app
	}

	static setreq(req){
		this.req = req
	}

	static setsubsection(csubsection)
	{
		this.csubsection = csubsection;
	}

	static loadconfig(callback){
		
		let self = this;
		let path = "../"+self.app+"/config/config.js";
		Async.auto({
            start: function (dones) {
            	
				try
				{
					self.config = require(path);
					return callback(null, true);
				}catch(err){

					console.log(err)
				}
            },
            csyberconfig: ["start",function (results, dones) {
            	

            	
				try
				{
					self.csyberconfig = require(path);
					dones();
				}catch(err){
					dones(err)
				}
            }]
            
        }, (err, _results) => {
            if (err);
            callback(err);
        });
	}

	 static whichorganization()
    {
        let owner = this.owner || "csystem";
        return owner;
    }

    static setowner(owner)
    {
        this.owner = owner;
    }

	static whoami(done){
		let self = this;
		let owner = self.whichorganization();
		let owners = self.user.owner
		// console.log(owners)
		Async.auto({
            start: function (dones) {
            	try{
		            let path = "../"+self.app+"/config/config.js";
					let user = self.user;
					//get his apps
					let collection = self.collection;
					self.collection = "apps";
					let len = Objlen(owners)
					owners[len] = "csystem";
					csyberUser.getusersapps(user._id, function(err, apps){
						var mygroup = {}
						let ind = 0;
						for(let index in apps)
						    for(let app in apps[index])
					    	{
					    		// console.log("is app...................")
					    		// console.log(app)
						    	mygroup[app] = {}
						    	//if(app == self.app)
						      		// for(let ca in apps[index][app])mygroup[app][ind++] = apps[index][app][ca][owner];
						      		// for(let ca in apps[index][app])
						      		// 	console.log(apps[index][app][ca])
						      		let ownindex;
						      		let z;
						      		
						      		for(ownindex in owners)
						      		{
						      			owner = owners[ownindex]
						      			for(let ca in apps[index][app])mygroup[app][ind++] = apps[index][app][ca][owner];
						      			
						      		}
						    }
						
						if(ind == 0)mygroup[0] = {owner:"nobody"};
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
            // //console.log("////whoamino er")
            done(err);
        });
		/**/
	}

	static appisEnabled(app, installing, url)			//in user.apps and is enabled
	{
		
		let enabled = false;
		//// //console.log(this.mygroups)
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

			// console.log(this.mygroups)
			while(groups.length > 0)
			{
				let tmp = groups.pop();
				test = config.get("/enabled/"+tmp)
				if(false !==  test && undefined !== test)enabled = test;
			}
			if(enabled !== false && url === true)enabled = config.get("/url")
			
		}catch(err)
		{
			//// //console.log(err);
			return false;
		}
		return enabled;
	}

	static showPage(iheadless, title, status, ipage, req, res, elements){

		let self = this;
		try
		{
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
				self.fromchild(function(err, results){	

					if(! self.app)self.setapp("csystem")
					self.setreq(req)
					let fromchild = results
					

					 Async.auto({
						loadconfig: function (done) {
						self.loadconfig(function(err, _results){
						  done(err);
						});
						},
						whoami: ['loadconfig', function (_results, done) {
						self.whoami(function(err, _results){
							// //console.log("EO whomi")
							// //console.log("showing page...")
						  done(err, _results);
						});
						}],
						checkenabled:["whoami", function(_results, done){
							// //console.log("are groups")
							// //console.log(self.mygroups)
						let tmpstack = []
						for(let index in self.mygroups)
						{
							
						 	tmpstack.push(index)
						}
						let tmpapp;
						while(tmpapp = tmpstack.pop())apptoloadtest.push(tmpapp)
						while(tmpapp = apptoloadtest.pop()){
						 // //console.log(tmpapp)
						  let tmpi = self.appisEnabled(tmpapp)
						  if(tmpi !== false && tmpi !== undefined)
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
						     // console.log(tmpi+"........."+tmpapp)
						     // console.log(appstoload)
						      
						  }

						}

						self.installedapps(appstoload, function(err, ret){
							appstoload = ret;
							
							done();
						})
						// console.log(appstoload)
						// done(); 

					    }]
					}, (err, _results) => {
					      if (err);

					      let sidemenuitems = {}// Config.get('/sidemenuitems');
					      sidemenuitems.apps = {}
						  sidemenuitems.apps.apps = appstoload;
						  sidemenuitems.apps.class = "fa fa-pencil fa-fw";

						  
						  let tmp;
						  for( tmp in sidemenuitems.apps.apps)if(sidemenuitems.apps.apps[tmp]['default'] === false)delete sidemenuitems.apps.apps[tmp]
						  let apps = {}
						 elements = self.setelements(elements);
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
						    elements:elements,
						    fromchild:fromchild,
						  });
						  
					});

				});
		
			//
			
			});
		}catch(error)
		{

		}	
	}

	static installedapps(appslist, callback)
	{

		let self = this;
		let collection = self.collection;
		self.collection = "allapps";

		let appsi = [];
		let i;
		for(i in appslist)appsi.push(appslist[i].name)
		Async.eachSeries(Object.keys(appsi), function (i, next){ 
			let item = appsi[i]
			
			self.find({appname:item}, (err, app) => {
		      if (err);
		      if(app.length === 0 )
		      {
		      	delete appslist[item]
		      }
		      // console.log("item:"+app)
		      next();
			});
         }, function(err) {

           callback(null, appslist);
        }); 
		// Async.
		// self.find({appname:app}, (err, userapps) => {
		//       if (err);
		      

		// });

		// self.find({})
		// console.log(appslist)
		
	}

	static fromchild(callback)
	{
		let self = this;
		let ret = {}
		let appname = self.app;
		if(appname === "csystem")
			return callback(null, {});
		let app = require(__dirname+"/../"+self.app+"/index")
		try
		{
			app.getresults(self.req, self.res, self.pagename, function(err, results){
			callback(null, results)
			})
			
		}catch(error)
		{
			callback(error, {})
		}
	}

	static setelements(elements)
	{
		let self = this;
		try
		{
			
			// //console.log("elements...")
			let config = require(__dirname+"/../"+self.app+"/config/config")
			// //console.log("config path: "+__dirname+"/../"+self.app+"/config/config")
	    	// if(JSON.stringify(elements).length == 2)				//empty object
	    	if(elements === false)
	    	{
	    		elements = config.get("/elements")
	    	}
	    	if(!self.sections || self.sections === false)
			{
				//console.log("met condition")
				//console.log(elements)
				//delete elements.csections
				//console.log(elements)
			}

			//console.log(self.req)
	    	elements.meta = self.pagemeta;
	    	elements = self.getdashboards(elements)
	    	elements = self.getothersideelemitems(elements)
	    	if(self.section !== undefined)elements.section = self.section
	    	if(self.subsection !== undefined)elements.subsection = self.subsection
	    	if(self.app !== undefined)elements.app = self.app
	    	if(self.isguest !== undefined)elements.isguest = self.isguest

	    	if(self.csubsection !== false)
			{
				//look for this in config
				let csubsections = elements.csections
				// console.log(csubsections)
			}
	    	// //console.log("are elements")
	    	// //console.log(elements)
	    	// return elements
	    }catch(error)
	    {
	    	if(elements === false) return {}
	    	
	    }
		
		return elements
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
            		// //console.log("is accept..."+accepts)
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
	static setpage(page, pagename)
	{
		this.page = page;
		this.pagename = pagename;
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

		// //console.log(others)
		let i = 0;
		let sections;
		(this.sections!==undefined && this.sections !== false)?sections=this.sections:sections="";

		let csections = {};

		if(sections !== "")
		{
			for(let index in self.mygroups[self.app])
			{
				let group = self.mygroups[self.app][index];
				let tmp = self.config.get("/elements/csections/"+group+"/"+sections)
				// console.log("/elements/csections/"+group+"/"+sections)
				//tmp == undefined?others[i++] = {}:others[i++] = tmp;
				if(tmp !== undefined)
				{
					let tmp1;
					for(tmp1 in tmp)

						csections[tmp1] = tmp[tmp1];
				}
				self.page = self.page || self.config.get("/elements/csections/"+group+"/"+sections+"/defaultpage");
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
		elements.csections = csections;
		try
		{
			elements.title = self.title || self.app;
			elements.description = self.description ||elements.description;
			elements.keywords = self.keywords ||elements.keywords;
			elements.level = self.level ||elements.csections.level || 1;
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