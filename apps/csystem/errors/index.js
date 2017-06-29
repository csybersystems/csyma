const Config = require('../../../config/config');
const csystem = require("../index");
const path = require('path');
const Async = require('async');

class errohandler extends csystem
{

	static error404(req, res)
	{
		//this.init(req, res);
		let query = req.path;
		let queryparts = query.split(".");
		if(queryparts.length >= 2) 				//looking for a resource that does not exist
		{
			console.log(queryparts.length)
			res.status(404).send('');
			return;
		}

		let headless = req.query.headless || false;
		// console.log(headless)
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



	
}

module.exports = errohandler