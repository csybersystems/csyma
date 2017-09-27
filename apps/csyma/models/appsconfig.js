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

const userappsSchema = new Schema({
    _id:{               //userid
        type: ObjectId, 
        unique: true 
    },
    apps:[{
        _id: { 
            type: String, 
            unique: false 
        },
        groups:[{
            _id:{ 
                type: String, 
                unique: false 
            },
            name: { 
                type: String, 
                unique: false 
            },
        }]
    }],
timeCreated: String,
}, { timestamps: true });


class appsConfig extends MongoModels
{
    static setupallapps(callback)
    {
        let self = this;
        let _root = __dirname+"/../../";
        //console.log("setting up all apps")

        self.collection = 'allapps';
        self.schema = allappsSchema;


        Async.auto({//
            drop: function(done){
               self.deleteMany(done);
            },
            create:["drop", function(results, done){
                let items = fse.readdirSync(_root);
                // //console.log(__dirname)

                for (let i=0; i<items.length; i++) {
                    ////console.log(items[i])
                    if(items[i] == "." || items[i] == "..")continue;
                    if(items[i].split(".").length > 1)continue;
                    let appname = items[i];

                    let thisappconfig = require(_root + appname+"/config/config.js")
                    //console.log(items[i])
                    let enabled = thisappconfig.get("/enabled")
                    let displayname = thisappconfig.get("/displayname")
                    //console.log(enabled)
                    //console.log(displayname)

                    //create appentry...
                    const document = {
                            appname: appname,
                            enabled: enabled,
                            timeCreated: new Date()
                        };
                   // //console.log(document)
                   // //console.log("setting results...")
                    self.insertOne(document, function(err, results){
                     //   //console.log("setting results...")
                       // //console.log(err)
                        ////console.log(results)
                        done()
                    });
                }
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
            //console.log("......................gor results")
            callback(err, results)
        });

       // return {}
    }
//User = mongoose.model('User', userSchema);
}


module.exports = appsConfig;