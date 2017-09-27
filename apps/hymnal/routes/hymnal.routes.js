const csystem = require(__dirname+"/../../apps/csystem/index");
const Config = require(__dirname+'/../../config/config');
const csyma = require(__dirname+"/../../apps/hymnal/index");

class hymnalroutes
{
  constructor(app, passport)
  {
    app.get('/hymnal/index', function (req, res) {
        // console.log(req.params)
      //
      //csyma.init_child()
      csyma.init_child(req,res, function(err, results){
          csyma.settitle("Hymnal");
          csyma.setmeta("this is teh meta data");
          console.log("................................................is hymnal..........................")
          csyma.getelements(req,res, function(err, results){
          // console.log(results)
          
      })
          
      })
    })

    app.get('/hymnal/home/h/:lang', function (req, res) {
      // console.log(req.params)
      //
      //csyma.init_child()
      csyma.init_child(req,res, function(err, results){
          csyma.settitle("page titled");
          if(req.params.lang == "e")
            {
              csyma.settitle("NZK");
              //csyma.setheadless(true)
            }
          if(req.params.lang == "k")csyma.settitle("SDAH");
          if(req.params.lang == "e")csyma.setpage("apps/hymnal/english1")
          if(req.params.lang == "k")csyma.setpage("apps/hymnal/kiswahili")

          if(req.params.lang == "e1")
          {
            csyma.settitle("NZK");
            csyma.setheadless(true)
          }
          if(req.params.lang == "k1")csyma.settitle("SDAH");
          if(req.params.lang == "e1")csyma.setpage("apps/hymnal/english1")
          if(req.params.lang == "k1")csyma.setpage("apps/hymnal/kiswahili")
          //csyma.setheadless(true)
         // console.log(csyma.page)
          //other head elements....
          csyma.setmeta("this is teh meta data");
          csyma.getelements(req,res, function(err, results){
          // console.log(results)
          
      })
          
      })
      })

    app.get('/hymnal/app/:appname/:action', function (req, res) {
      console.log(req.params)
      res.send('got params')
    })
  }
}

module.exports = hymnalroutes