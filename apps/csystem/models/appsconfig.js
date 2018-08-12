/*
 * file: User.js
 * Required to read users
 */
//const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const MongoModels = require('mongo-models');
const mongoose = require('mongoose');
const fse = require('fs-extra');
const Joi = require('joi');
const Async = require('async');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


const allappsSchemao = new Schema({
    appname:{
        type: String, 
        unique: true 
    },
    enabled: [{
        group:String,
        enabled:Boolean
    }]
})

const allappsSchema = Joi.object().keys({
    _id: Joi.object(),
    appname: Joi.string().required(),
    enabled: Joi.object().keys({
        group: Joi.string(),
        enabled: Joi.boolean()
    }),
    timeCreated: Joi.date()
});




class appsConfig extends MongoModels
{
    static setupallapps(callback)
    {
        let self = this;
        let _root = __dirname+"/../../../config/";
        //console.log("setting up all apps")

        self.collection = 'allapps';
        self.schema = allappsSchema;


        Async.auto({//
            drop: function(done){
               self.deleteMany(done);
            },
            create:["drop", function( done, results){
                let items = fse.readdirSync(_root);

                Async.each(items, function (appname, next){ 
                    let path = _root+appname;
                    fse.lstat(path, (err, stats) => {
                        // console.log(`path: ${path}  ${stats.isFile()}`)
                      if(stats.isFile() === true)
                      {
                          next();
                      }else
                      {

                            let thisappconfig = require(path+"/config.js")
                            // console.log("thisappconfig")
                            // console.log(appname)
                            // console.log(_root + appname+"/config.js")
                            let enabled = thisappconfig.get("/enabled")
                            let displayname = thisappconfig.get("/displayname")
                            const document = {
                                    appname: appname,
                                    enabled: enabled,
                                    timeCreated: new Date()
                                };
                            self.insertOne(document, function(err, results){
                                next()
                            });
                        }
                    })
                }, function(err) {

                  done()
                }); 

                // Async.eachSeries(Object.keys(items), function (i, next){ 
                //     console.log(items[i])
                //     //skip it if it is a file.

                //     if(items[i] == "." || items[i] == "..")next();
                //     if(items[i].split(".").length > 1)next();
                //     let appname = _root+items[i];

                //     let thisappconfig = require(appname)
                //     console.log("thisappconfig")
                //     console.log(appname)
                //     console.log(_root + appname+"/config.js")
                //     let enabled = thisappconfig.get("/enabled")
                //     let displayname = thisappconfig.get("/displayname")
                //     const document = {
                //             appname: appname,
                //             enabled: enabled,
                //             timeCreated: new Date()
                //         };
                //     self.insertOne(document, function(err, results){
                //         next()
                //     });
                //  }, function(err) {
                //     process.exit();
                //    done();
                // }); 
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }

            callback(null);
        });

        
    }
    
    static setuponeapps(app, callback)
    {
        let self = this;
        let _root = __dirname+"/../../../config/";

        self.collection = 'allapps';
        self.schema = allappsSchema;


        Async.auto({//
            drop: function(done){
               done()
            },
            create:["drop", function(results, done){
                let items = fse.readdirSync(_root);
                while(items.pop());
                items.push(app)
                Async.eachSeries(Object.keys(items), function (i, next){ 
                    if(items[i] == "." || items[i] == "..")next();
                    if(items[i].split(".").length > 1)next();
                    let appname = items[i];

                    let thisappconfig = require(_root + appname+"/config.js")
                    let enabled = thisappconfig.get("/enabled")
                    let displayname = thisappconfig.get("/displayname")
                    const document = {
                            appname: appname,
                            enabled: enabled,
                            timeCreated: new Date()
                        };
                    self.insertOne(document, function(err, results){
                        next()
                    });
                 }, function(err) {
                   done();
                }); 
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }

            callback(null);
        });

        
    }
    

    static getallapps(callback){
        let self = this;
        self.collection = 'allapps';
        self.schema = allappsSchema;
        self.find(function(err, results){
            callback(err, results)
        });

       // return {}
    }
//User = mongoose.model('User', userSchema);
}


module.exports = appsConfig;