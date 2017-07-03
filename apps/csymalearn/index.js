const User = require(__dirname+'/models/User')
const Config = require(__dirname+'/../../config/config');
const Async = require('async');

class csystem extends User
{
	static init(req,res, done)
	{

		let self = this;
		if(!req.user)
		{
			this.findOne({email:Config.get("/guestemail")}, function(err, docs){
				self.user = docs.toObject();	//Assume to error
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

		Async.auto({
            start: function (dones) {
            	let path = "../"+self.app+"/config/config.js";
				try
				{
					self.config = require(path);
					dones(null, true);
				}catch(err){

					//dones(err)
				}
            },
            csyberconfig: ["start",function (results, dones) {
            	let path = "../"+"csystem"+"/config/config.js";
				try
				{
					self.csyberconfig = require(path);
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
		console.log("////whoami")
		let self = this;
		Async.auto({
            start: function (dones) {
            	console.log("////whoami")
            	try{
		            let path = "../"+self.app+"/config/config.js";
					let user = self.user;
					console.log(user)
					let apps = JSON.parse(JSON.stringify(user.apps));
					console.log("////whoami")
					console.log("apps")
					console.log(apps)
					var mygroup = {}
					let ind = 0;
					for(let index in apps)
					    for(let app in apps[index])
					     // if(app == self.app)
					      	for(let ca in apps[index][app])mygroup[ind++] = apps[index][app][ca]["name"];
					
					console.log("apps")
					consle.log()
					if(ind == 0)mygroup[0] = {"name":"nobody"};
					self.mygroups = mygroup;
					console.log("////whoami")
					dones()

				}catch(err){
					self.send(err)
					console.log("////whoami")
					dones(err)
				}
			}
        }, (err, _results) => {
            if (err) ;
            console.log("////whoami")
            done(err);
        });
		/**/
	}
}

module.exports = csystem