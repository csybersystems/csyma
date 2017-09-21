const Config = require(__dirname+'/../../config/config');
const Async = require('async');
const csystem = require(__dirname+"/../csystem/index");
const csyberUser = require(__dirname+"/../csystem/models/csyberuser");
const  Objlen = require('object-length');
const {ObjectId} = require('mongodb'); // or ObjectID 
// or var ObjectId = require('mongodb').ObjectId if node version < 6
const safeObjectId = s => ObjectId.isValid(s) ? new ObjectId(s) : null;

class csyma extends csystem
{
	static init_child(req,res, done)
	{

		let self = this;
		this.setapp("csyma")
		this.setreq(req)
		self.res = res
		self.req = req
		this.init(req,res,done)
		
	}

	static getresults(req, res, page, callback)
	{
		try
		{
			let ret = {}
			let self = this;
			self.req = req;
			self.res = res;
			switch(page)
			{
				case "users":
					self.usersfunc("user",callback)
					break;
				case "organizations":
					self.usersfunc("organization",callback)
					break;
				case "manageuser":
				case "manageorg":
					self.appsfunction(req, callback)
					break;

				default:
					callback(null, {})
					;
			}
		}catch(error)
		{
			console.log(error)
			return callback(error)
		}
	}

	static usersfunc(acctype, callback)
	{
		let self = this;
		let action = self.req.params.action;
		if(action === undefined)action = "get";
		let ret = {};
		switch(action)
		{
			case "get":
				self.getusers(acctype,callback);
				break;
			default:
				;
		}
		// return {abc:24}
	}

	static appsfunction(req, callback)
	{
		try
		{
			let self = this;
			let id = req.params.uid===undefined?req.user._id:req.params.uid;
			let collection = self.collection;
			Async.auto({
				allapps:function(done)
				{
					
					self.collection = "allapps"
					self.find({}, (err, results) => {
						let allapps = {}
						let i;
						for(i in results)
						{
							allapps[results[i].appname] = {groups:results[i].enabled, id:results[i]._id}
						}
						// console.log(allapps)
						done(null, allapps)
					})
				},
				myapps: ['allapps', function(results, done){
					self.collection = "apps"
					self.find({_id:safeObjectId(id)},(err, results) => {
						self.collection = collection;
						// console.log(results[0].apps)
						let myapps = {}
						let i;
						try
						{

							let iresults = JSON.stringify(results)
							let allmyapps = results[0].apps
							let allmygroups = {}
							for(i in allmyapps)
							{
								let singleapp = allmyapps[i]
								let appname;
								for(appname in singleapp)
								{
									let singleappdata = singleapp[appname]
									
									let j = 0;
									let groups = {groups:{}};
									for(j in singleappdata)
									{
										let k;
										
										for(k in singleappdata[j])
										{
											let groupname = singleappdata[j][k]
											if(groups[groupname] === undefined)groups.groups[groupname] = {};
											groups.groups[groupname][k] = k;
										}
										
									}
									allmygroups[appname] = groups
								}
							}
							done(null, allmygroups)	//assume no error
						}catch(error)
						{
							done(error)
						}
					})
				}],
				sortapps: ['myapps', function(results, done){
					try
					{

						let allapps = results.allapps;
						let myapps = results.myapps;
						let appslist = {}

						let app;
						let appslistindex = 0;
						let uninstalledapps = {}
						let uninstalledappsind = 0;
						for(app in allapps)
						{
							if(myapps[app] !== undefined)
							{
								let allappsgroups = allapps[app].groups;
								let myappsgroups = myapps[app].groups;
								let groups = {}
								let group;
								for(group in allappsgroups)
								{
									let groupactive = Object.keys(myappsgroups).indexOf(group);
									groups[group] = (groupactive !== -1)?1:0
								}

								let isinstalled = Object.keys(myapps).indexOf(app);
								appslist[appslistindex] = {}
								let ins = (isinstalled !== -1)?1:0
								appslist[appslistindex++]= {name:app, ins : ins, id:allapps[app].id, groups:groups};
							}else
							{
								uninstalledapps[uninstalledappsind++] = {name:app, id:allapps[app].id}
							}
						}
						done(null, {apps:appslist,uninstalledapps:uninstalledapps})
					}catch(error)
					{
						done(error)
					}
				}],
			},(err, results) => {
				if(err)
				{
					self.res.send({"err":"Some error occured"})
					return callback(err)
				}
				let apps = results.sortapps.apps;
				let ret = {apps:apps, uid:id, uninstalledapps:results.sortapps.uninstalledapps}
				// console.log(ret)
				callback(null, ret)
			})
		}catch(error)
		{
			console.log(error)
			return callback(error)
		}

	}

	static getusers(acctype, callback)
	{
		let self = this;
		let numusers, users;
		let myusers = {}
		let collection = self.collection;
		self.collection = "users"
		Async.auto({
		    start: function (done) {
		    	
				self.find({acctype:acctype}, {}, (err, allusers) => {
					self.collection =collection;
				    if (err) 
				    	dones(err)

				    let i;
				    let numusers = 0;
				    for(i in allusers)
				    {
				    	let j;

				    	let k = 0;
				    	for(j in allusers[i].owner)
				    	{
				    		try
				    		{
				    			if(allusers[i].owner[j] === self.req.user.id && allusers[i]._id != self.req.user.id)
					    		{
					    			myusers[allusers[i]._id] = allusers[i]
					    			numusers++;
					    		}
				    		}catch(error)
				    		{

				    		}
				    		
				    	}
				    }
				  
				    users = myusers;
				   	done(null, {users:users, numusers:numusers})
					 
				 });
					
		    },
		}, (err, results) => {
		    callback(null, results.start)
		});
	}


	static deletechildren(id, callback)
	{
		let self = this;
		self.collection = "users"
		Async.auto({
		    start: function (done) {
		    	
				self.find({}, {}, (err, allusers) => {
				    if (err) 
				    	dones(err)

				    let i;
				    let numusers = 0;
				    let onlyowner = {};
				    let isalsoowner = {}
				    let k = 0;
				    let j;
				    for(i in allusers)
				    	for(j in allusers[i].owner)
					    	if(allusers[i].owner[j] === id)
					    		isalsoowner[k++] = allusers[i];
				    for(i in isalsoowner)
				    {
				    	
				    	k = 0;
				    	onlyowner[i] = true;		//assume user is the only owner
				    	for(j in isalsoowner[i].owner)
				    	{
				    		
				    		try
				    		{
				    			
				    			

				    			// console.log("Testing.....")
				    			// console.log(isalsoowner[i].owner[j]+"......."+id+"......."+isalsoowner[i]._id)
				    			if(isalsoowner[i].owner[j].toString() !== id.toString() && isalsoowner[i].owner[j].toString() !== isalsoowner[i]._id.toString())
					    		{
					    			// console.log(isalsoowner[i].owner[j]+"......."+id+"......."+isalsoowner[i]._id)
					    			onlyowner[i] = false;
					    		}
					    		
				    		}catch(error)
				    		{

				    		}
				    		
				    	}
				    }

				    let toremove = {};
				    k = 0;
				    for(i in onlyowner)
				    {
				    	if(onlyowner[i] === true)toremove[k++] = isalsoowner[i]._id;

				    }
				   	done(null, toremove)
					 
				 });
					
		    },
		}, (err, results) => {
		    callback(null, results.start)
		});
	}

	static exec(req, res, callback)
	{
		let self = this;

		try
		{
			let action = req.params.action;
			let appid = req.params.appid
			let uid = req.params.uid;
			let group = req.params.group;

			self.appaction_appid = appid
			self.appaction_group = group
			self.appaction_action = action
			self.appaction_uid = uid
			self.res = res;
			self.req = req;


			let user 
			switch(action)
			{
				case "add":
					self.addgroup(callback)
					break;
				case "remove":
					self.removegroup(callback)
					break;;
				case "uninstall":
					self.uninstallapp(callback)
					break;;
				case "install":
					csyberUser.installapp(safeObjectId(self.appaction_uid), self.appaction_group, "free", function(err, results){
						//assume to error
						self.res.send(JSON.stringify({"msg":self.appaction_action+" successful.","reloadpage":1}))
	                	callback();
					})
					break;;
				default:
					callback();
				
			}
		}catch(err)
		{
			console.log(err)
			res.send({"err":'Unable to '+action+'. Please try later'});
		}
		
	}

	static uninstallapp(callback)
	{
		let self = this;
		let collection = self.collection;
		self.collection = "allapps"
		self.find({_id:safeObjectId(self.appaction_appid)}, (err, app) => {
	    	if (err);	//assume;
	    	let appname = app[0].appname
	    	self.collection = "apps"
	      	self.find({_id:safeObjectId(self.appaction_uid)}, (err, userapps) => {
		      if (err){
		      	self.res.send({"err":'Unable to '+self.appaction_action+'. Please try later'})
		      	return callback();
		      }
		      let i;
		      let apps = {}
		      let appsi = {}
		      let k = 0;
		      for(i in userapps[0].apps)
		      {
		      			    
		      	if(userapps[0].apps[i][appname] !== undefined)
		      	{
		      		
		      		//ignore it
		      	}else
		      	{
		      		appsi = userapps[0].apps[i]
		      		apps[k++] = appsi;
		      	}

		      }

		     	let updateObj = {
	            $set:{
	                apps:apps
	                    
	                    }
	                };  
	            self.findByIdAndUpdate(safeObjectId(self.appaction_uid), updateObj,{new:true},function(err, results){
	                if (err){
						self.res.send({"err":'Unable to '+self.appaction_action+'. Please try later'})
						return callback();
				    }
	                self.res.send(JSON.stringify({"msg":self.appaction_action+" successful.","reloadpage":1}))
	                callback();
	            });
		    });
	      
	    });
	}

	static removegroup(callback)
	{
		let self = this;
		let collection = self.collection;
		self.collection = "allapps"
		self.find({_id:safeObjectId(self.appaction_appid)}, (err, app) => {
	    	if (err);	//assume;
	    	let appname = app[0].appname
	    	self.collection = "apps"
	      	self.find({_id:safeObjectId(self.appaction_uid)}, (err, userapps) => {
		      if (err){
		      	self.res.send({"err":'Unable to '+self.appaction_action+'. Please try later'})
		      	return callback();
		      }
		      let i;
		      let apps = {}
		      let appsi = {}
		      for(i in userapps[0].apps)
		      {
		      			      	
		      	if(userapps[0].apps[i][appname] !== undefined)
		      	{
		      		
		      		let j = 0;
		      		let tmp = userapps[0].apps[i][appname];
		      		for(j in userapps[0].apps[i][appname])
		      		{
		      			let ind;
		      			for(ind in userapps[0].apps[i][appname][j])
		      			{
		      				let mygrp = userapps[0].apps[i][appname][j][ind]
		      				if (mygrp === self.appaction_group)
		      					delete tmp[j]
		      			}
		      		}
		      		let tmpe = {}
		      		tmpe[appname] = tmp
		      		appsi = tmpe;
		      	}else appsi = userapps[0].apps[i]
		      	apps[i] = appsi;

		      }

		     	let updateObj = {
	            $set:{
	                apps:apps
	                    
	                    }
	                };    
	            self.findByIdAndUpdate(safeObjectId(self.appaction_uid), updateObj,{new:true},function(err, results){
	                if (err){
						self.res.send({"err":'Unable to '+self.appaction_action+'. Please try later'})
						return callback();
				    }
	                self.res.send(JSON.stringify({"msg":self.appaction_action+" successful.","reloadpage":1}))
	                callback();
	            });
		    });
	      
	    });
	}

	static addgroup(callback)
	{
		let self = this;
		let collection = self.collection;
		self.collection = "allapps"
		self.find({_id:safeObjectId(self.appaction_appid)}, (err, app) => {
	    	if (err);	//assume;
	    	let appname = app[0].appname
	    	self.collection = "apps"
	      	self.find({_id:safeObjectId(self.appaction_uid)}, (err, userapps) => {
		      if (err){
		      	self.res.send({"err":'Unable to '+appaction_action+'. Please try later'})
		      	return callback();
		      }
		      let i;
		      let apps = {}
		      let appsi = {}
		      for(i in userapps[0].apps)
		      {
		      			      	
		      	if(userapps[0].apps[i][appname] !== undefined)
		      	{
		      		
		      		let tmp = userapps[0].apps[i][appname]
		      		let j = 0;
		      		let len = Objlen(tmp)
		      		tmp = {}
		      		let k;
		      		tmp[appname] = {}
		      		for(k in  userapps[0].apps[i][appname])
		      			tmp[appname][j++] = userapps[0].apps[i][appname][k]
		      		tmp[appname][len] = {}
		      		tmp[appname][len][self.appaction_uid]=self.appaction_group
		      		appsi = tmp;
		      	}else appsi = userapps[0].apps[i]
		      	apps[i] = appsi;

		      }



		     	let updateObj = {
	            $set:{
	                apps:apps
	                    
	                    }
	                };    
	            self.findByIdAndUpdate(safeObjectId(self.appaction_uid), updateObj,{new:true},function(err, results){
	                if (err){
						self.res.send({"err":'Unable to '+self.appaction_action+'. Please try later'})
						return callback();
				    }
	                self.res.send(JSON.stringify({"msg":self.appaction_action+" successful.","reloadpage":1}))
	                callback();
	            });
		    });
	      
	    });
		
	}

	
	
}

module.exports = csyma