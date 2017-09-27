const Config = require(__dirname+'/../../config/config');
const Async = require('async');
const csystem = require(__dirname+"/../csystem/index");

class csyma extends csystem
{
	static init_child(req,res, done)
	{

		let self = this;
		this.setapp("csymaconstruction")
		this.setreq(req)
		this.init(req,res,done)
		
	}


	
	
}

module.exports = csyma