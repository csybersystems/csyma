const csystem = require(__dirname+"/../apps/csystem/index");
const Config = require(__dirname+'/../config/config');
const csyma = require(__dirname+"/../apps/csyma/index");

class csymaroutes
{
  
  
  constructor(app, passport)
  {
    app.get('/csyma', function (req, res) {                 
        csyma.init_child(req,res, function(err, results){
          // csyma.settitle("page titled");
          csyma.setpage(false);//clear selection if any
          csyma.getelements(req,res, function(err, results){ })
          
        })
    })


    app.get('/csyma/page/:app/:page/:action?/:uid?', function (req, res) {                 //loading static pages...
        const app = require(__dirname+"/../apps/"+req.params.app+"/index");
        app.init_child(req,res, function(err, results){
          app.settitle(req.params.page);
          // app.setdescription("site under construction");
          // app.setkeywords("site under construction");
          app.setpage("apps/"+req.params.app+"/"+req.params.page, req.params.page);
          // console.log("apps/"+req.params.app+"/"+req.params.page);
          // console.log(req.params.page)
          app.setsections(req.params.page);     //load config values from elements.csections
          console.log(req.params.page)
          app.getelements(req,res, function(err, results){ })
          
        })
    })

    app.get('/csyma/section/:app/:section', function (req, res) {                 //loading sections...
        const app = require(__dirname+"/../apps/"+req.params.app+"/index");
        app.init_child(req,res, function(err, results){
          app.settitle(req.params.section);
          // app.setdescription("site under construction");
          // app.setkeywords("site under construction");
          //app.setpage("apps/"+req.params.app+"/"+req.params.section);
          app.setpage(false, req.params.section);
          // console.log(req.params.section)
          app.setsections(req.params.section);
          app.getelements(req,res, function(err, results){ })
          //each section has its own stuff, more like when loading an app...
          
        })
    })

    app.post('/csyma/app/:action/:appid?/:uid?/:group?', function (req, res) {
        ///csyma/app/add    /   59/hjhkj/root
      // console.log(req.params)
      //
      //csyma.init_child()
      csyma.init_child(req,res, function(err, results){
          // csyma.settitle("page titled");
          //other head elements....
          // csyma.setmeta("this is teh meta data");
          // csyma.getelements(req,res, function(err, results){
          // // console.log(results)
          
        //   })
        csyma.exec(req,res,function(err, results){

        })
          
      })
      //
      
    })

    app.get('/csyma/app/:appname/:action', function (req, res) {
      console.log(req.params)
      res.send('got params')
    })

    return app;
  }

}

module.exports = csymaroutes