/*
 * file: csyberuser.js
 * Required to create new users
 */
'use strict';
const bcrypt = require('bcrypt-nodejs');
// const Account = require('./account');
// const Admin = require('./admin');
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const Config = require('../../../config/config');
const appsConfig = require('./appsconfig.js');

const Usercollection = "users"


const userappsSchema = new Schema({
    _id:{               //userid
        type: ObjectId, 
        unique: true 
    },
    apps: [],
    // apps:{
    //     _id: { 
    //         type: String, 
    //         unique: false 
    //     },
    //     groups:[{
    //         _id:{ 
    //             type: String, 
    //             unique: false 
    //         },
    //         name: { 
    //             type: String, 
    //             unique: false 
    //         },
    //     }]
    // },
timeCreated: String,
}, { timestamps: true });


class User extends MongoModels {
    static generatePasswordHash(password, callback) {

        Async.auto({
            salt: function (done) {

                Bcrypt.genSalt(10, done);
            },
            hash: ['salt', function (results, done) {

                Bcrypt.hash(password, results.salt, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, {
                password,
                hash: results.hash
            });
        });
    }

    static clear(callback){
        const self = this;
        let collection = self.collection;
        
        Async.auto({//
            drop: function(done){
               self.deleteMany(function(){
                self.collection = 'apps';
                self.deleteMany(function(){
                    self.collection = collection;
                    done();
                });
               });
               
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }

            callback(null);
        });
    }

    static getusersapps(id, callback)
    {
        let self = this;
        let collection = self.collection;
        self.collection = "apps";
        self.findById(id, function(err, results){
            if(err) return callback(err)
            // console.log(results)
            self.collection = collection
            callback(null, results.apps)
        })
        
    }

    static installapp(id, app, perm, callback){
        const self = this;
        let singleappConfig = require(__dirname + "/../../"+app+"/config/config")
        let usergroups = singleappConfig.get("/"+perm);
        usergroups == undefined?usergroups = {}:false
        usergroups.groups != undefined?usergroups = usergroups.groups: usergroups = {};
        Async.auto({
            getappid:  (done) => {
                let gid =0;
                self.findById(id, function (err, count) {//
                    if(count.apps != undefined)
                    {
                        if(count.apps[app] == undefined)gid = 0;
                        else gid = count.apps[app].length;         
                    }
                    done(null, gid);
            });
            },
             update:  ['getappid', (results, done) => {
                let gid = results.getappid;
                var apps = {}
                let groups = {}
                for(let group in usergroups)groups[gid++] = {name: usergroups[group]}
                apps[app] = groups;
                //  var updateObj = {
                //         $push:{
                //             apps:apps
                        
                //         }
                //     };    
                // // console.log("........=========================================1111111111111111111111111111")
                // // console.log(apps)

                const document = {
                    _id: id,
                    apps: [],
                    timeCreated: new Date()
                };

                self.collection = 'apps';
               // self.schema = userappsSchema;
               //   self.findById(id, function(err, results){
               //      // console.log(results)
               // })

               try
               {
                     self.insertOne(document, function(err, results){
                        // if(err)
                        // {
                            //throw new Error("record already exists")
                            // done()
                            //update rather than create new
                            let updateObj = {
                            $push:{
                                apps:apps
                                    
                                    }
                                };    
                            // console.log(id)
                            self.findByIdAndUpdate(id, updateObj,{new:true},function(err, results){
                                // console.log(err)
                                // console.log(results)
                                done()
                            });
                            // self.findById(id,function(err, results){
                            //   //  // console.log(err)
                            //     // console.log(results)
                            //     // console.log(results.apps.push({}))
                            //     done()
                            // });

                          //  done();
                        // }else
                        // {
                        //     // console.log(results)
                        //     done(null, results)                        
                        // }
                        
                    });
               }catch(error)
               {
                    // console.log("an error occured")
                    done()
               }
                
                // self.findByIdAndUpdate(id, updateObj,{new:true},done);
                //create new
           }]},   (err, results) => {

            if (err) { return callback(err); }
            callback();
              
      });
    }

    
    static setupallapps(callback)
    {
        appsConfig.setupallapps(function(){

            callback()
        });
       // callback();
    }
    static installallapps(id, perm, callback){
        let self = this;
        appsConfig.getallapps(function(err, allapps){
            // console.log("............................................all apps")

            // console.log(allapps)
            // console.log(allapps)
            let app;
            Async.eachSeries(Object.keys(allapps), function (i, next){ 
                app = allapps[i].appname
                self.installapp(id, app, perm, next)
            }, function(err) {
                callback();
            }); 
        });
        
        // Async.eachSeries(Object.keys(allapps), function (app, next){ 
        //   self.installapp(id, app, perm, next)
        // }, function(err) {
        //   callback();
        // }); 

       
    }



    static create(username, password, email, callback) {

        const self = this;
        let useremail,firstname,middlename,lastname;
        if(email.email != undefined)
            useremail = email.email
        else useremail = email

        if(email.name != undefined)
        {
            if(email.name.first != undefined)
                firstname = email.name.first
            else firstname = "New";

            if(email.name.middle != undefined)
                middlename = email.name.middle
            else middlename = "User";

            if(email.name.last != undefined)
                lastname = email.name.last
            else lastname = "";
        }
        else
        {
            firstname = "New";
            middlename = "User";
            lastname = "";
        }

        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this, password),
            newUser: ['passwordHash', function (results, done) {

                const document = {
                    isActive: true,
                    username: username.toLowerCase(),
                    password: results.passwordHash.hash,
                    email: useremail.toLowerCase(),
                    name:{
                        first: firstname, 
                        middle:middlename,  
                        last: lastname, 
                        other:""
                    },
                    gender:"",
                    profile:{
                        picture: "images/4e14f517d239010c439617922dc13543.png",
                    },
                    timeCreated: new Date()
                };

                self.collection = Usercollection;
               // self.schema = allappsSchema;
                self.insertOne(document, function(err, results){
                    // console.log(results)
                    done(null, results)
                });
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            results.newUser[0].password = results.passwordHash.password;

            callback(null, results.newUser[0]);
        });
    }

    static socialcreate(data, callback) {

        const self = this;
        Async.auto({
            newUser:  (done) =>{

                const document = {
                    name:{
                        first: "New", 
                        middle:"User",  
                        last: "", 
                        other:""
                    },
                    gender:"",
                    profile:{
                        picture: "",
                    },
                    tokens:[],
                    timeCreated: new Date()
                };
                if(data.email != undefined)document.email = data.email.toLowerCase();
                if(data.email != undefined)document.username = data.email.toLowerCase();
                if(data.facebook != undefined)document.facebook = data.facebook;
                if(data.github != undefined)document.github = data.github;
                if(data.twitter != undefined)document.twitter = data.twitter;
                if(data.google != undefined)document.google = data.google;
                if(data.linkedin != undefined)document.linkedin = data.linkedin;
                if(data.instagram != undefined)document.instagram = data.twitter;
                if(data.steam != undefined)document.steam = data.twitter;
                if(data.tokens != undefined)document.tokens=data.tokens;
                if(data.profile.name != undefined)document.profile.name = data.profile.name;
                if(data.name.first != undefined)document.name.first = data.name.first;
                if(data.profile.location != undefined)document.profile.location = data.profile.location;
                if(data.profile.picture != undefined)document.profile.picture = data.profile.picture;
                if(data.profile.gender != undefined)document.profile.gender = data.profile.gender;
                if(data.profile.gender != undefined)document.gender = data.profile.gender;
                if(data.profile.website != undefined)document.profile.website = data.profile.website;
                
                
               self.insertOne(document, done);
               //done()
            },
            installapps: ['newUser', (results, done) => { 
              const id = results.newUser[0]._id;
              self.installallapps(id, "free",done) 
            }],
        }, (err, results) => {

            if (err) {
                return callback(err);
            }
            callback(null, results.newUser[0]._id)
           // callback(null, results.newUser[0]);
        });
    }

    static findByCredentials(username, password, callback) {

        const self = this;

        Async.auto({
            user: function (done) {

                const query = {
                    isActive: true
                };

                if (username.indexOf('@') > -1) {
                    query.email = username.toLowerCase();
                }
                else {
                    query.username = username.toLowerCase();
                }

                self.findOne(query, done);
            },
            passwordMatch: ['user', function (results, done) {

                if (!results.user) {
                    return done(null, false);
                }

                const source = results.user.password;
                Bcrypt.compare(password, source, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            if (results.passwordMatch) {
                return callback(null, results.user);
            }

            callback();
        });
    }

    static findByUsername(username, callback) {

        const query = { username: username.toLowerCase() };

        this.findOne(query, callback);
    }

    comparePassword(candidatePassword, cb) {
      bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
      });
    };

    gravatar(size) {
      if (!size) {
        size = 200;
      }
      if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
      }
      const md5 = crypto.createHash('md5').update(this.email).digest('hex');
      return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    };

    constructor(attrs) {

        super(attrs);

        Object.defineProperty(this, '_roles', {
            writable: true,
            enumerable: false
        });
        
    }

    canPlayRole(role) {

        if (!this.roles) {
            return false;
        }

        return this.roles.hasOwnProperty(role);
    }

    hydrateRoles(callback) {

        if (!this.roles) {
            this._roles = {};
            return callback(null, this._roles);
        }

        if (this._roles) {
            return callback(null, this._roles);
        }

        const self = this;
        const tasks = {};

        if (this.roles.account) {
            tasks.account = function (done) {

                Account.findById(self.roles.account.id, done);
            };
        }

        if (this.roles.admin) {
            tasks.admin = function (done) {

                Admin.findById(self.roles.admin.id, done);
            };
        }

        Async.auto(tasks, (err, results) => {

            if (err) {
                return callback(err);
            }

            self._roles = results;

            callback(null, self._roles);
        });
    }
}


User.collection = Usercollection;


User.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
    name: Joi.object().keys({
        first: Joi.string(), 
        middle:Joi.string(),  
        last: Joi.string(), 
        other:Joi.string()
    }),
    gender: Joi.string(), 
    locale: Joi.string(), 
    roles: Joi.object().keys({
        admin: Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().required()
        }),
        account: Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().required()
        })
    }),
    /*apps: Joi.object().keys({
        _id: Joi.string().required(),
        groups: Joi.object().keys({
            _id: Joi.string().required(),
             name: Joi.string().required()
         })
    }),*/
    resetPassword: Joi.object().keys({
        token: Joi.string().required(),
        expires: Joi.date().required()
    }),
    timeCreated: Joi.date()
});


User.indexes = [
    { key: { username: 1, unique: 1 } },
    { key: { email: 1, unique: 1 } }
];

User.db = 'mongodb://localhost:27017/'+Config.get("/database/name");
Mongodb.MongoClient.connect(User.db, function(err, db) {
  User.db = db;
  MongoModels.db = db;

});

module.exports = User;