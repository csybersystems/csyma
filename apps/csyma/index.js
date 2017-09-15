const Config = require(__dirname+'/../../config/config');
const Async = require('async');
const csystem = require(__dirname+"/../csystem/index");

class csyma extends csystem
{
	static init_child(req,res, done)
	{

		let self = this;
		this.setapp("csyma")
		this.setreq(req)
		this.init(req,res,done)
		
	}

	static getresults(req, page, callback)
	{
		let ret = {}
		let self = this;
		self.req = req;
		switch(page)
		{
			case "users":
				self.usersfunc("user",callback)
				break;
			case "organizations":
				self.usersfunc("organization",callback)
				break;
			default:
				callback(null, {})
				;
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
				    			if(allusers[i].owner[j] === self.req.user.id)
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


	
	
}

module.exports = csyma