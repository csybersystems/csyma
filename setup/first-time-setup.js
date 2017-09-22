'use strict';
const Async = require('async');
const Mongodb = require('mongodb');
const Promptly = require('promptly');
var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
var validator = require('validator');
const bluebird = require('bluebird');
const nodemailer = require('nodemailer');
const passport = require('passport');
const fse = require('fs-extra');
const dotenv = require('dotenv');


//load enviroment variables before config
if (fse.existsSync('../.env'))
  dotenv.load({ path: '../.env' });
else
  dotenv.load({ path: '.env.example' });

const Config = require('../config/config');
const csyberUser = require('../apps/csystem/models/csyberuser');

mongoose.Promise = global.Promise;

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
Async.auto({
    testMongo:  (done) => {
        const db = Config.get("/database/uri");
        Mongodb.MongoClient.connect(db, {}, (err, db) => {

            if (err) {
                // console.error('Failed to connect to Mongodb.');
                return done(err);
            }

            db.close();
            done(null, true);
        });
    },
    rootEmail: ['testMongo', (results, done) => {
        done(null ,"surgbcx@gmail.com")
        Promptly.prompt('Root user email:', function(err,docs)
            {
                if (validator.isEmail(docs) === false) {
                    done("Invalid email address entered");
                  }else
                done(null, docs);
                ;
            });
    }],
    rootPassword: ['rootEmail', (results, done) => {
        done(null ,"surgbcx@gmail.com")
        Promptly.password('Root user password(atleast 5 characters):', function(err,docs){
            if(err)done(err);
            else if(docs.length < 5){done("Password must be atleast 5 characters")}
                else done(null, docs);
        });
    
    }],
    confirmrootPassword: ['rootPassword', (results, done) => {
        done(null ,"surgbcx@gmail.com")
        Promptly.password('confirm password:', function(err,docs){
            if(err)done(err);
            else if(results.rootPassword != docs){done("Passwords don't match")}
                else done(null, docs);
        });
    
    }],
    setupRootUser: ['confirmrootPassword', (results, done) => {

        Async.auto({
              connect: function (done) {
               // const db = 'mongodb://localhost:27017/'+Config.get("/database/name");
               // mongoose.connect(db, {}, done);
               done()
            },
             clean: ['connect', (dbResults, done) => {
                Async.auto({
                    clean1:(dones) => { csyberUser.clear(function(err, result){dones(err, result) })},                                                        
                   //clean1:(dones) => { UserModel.remove().exec().then(function(docs, err){dones(err, docs)});},
                   //clean2:(dones) => { AppModel.remove().exec().then(function(docs, err){dones(err, docs)});},
                   //clean3:(dones) => { GroupModel.remove().exec().then(function(docs, err){dones(err, docs)});}
                }, done);

            }],
            User: ['clean', function (dbResults, done) {
                        const username = results.rootEmail.toLowerCase();
                        const password = results.rootPassword;
                        const email = results.rootEmail.toLowerCase();
                        csyberUser.create(username, password, email,  function(err, result){done(err, result) });
                        //surgbc@gmail.com
            }],
            AddUsertoRootUsers: ['User', function (dbResults, done) { //surgbcx@gmail.com
                let app = "csyber";
                const id = dbResults.User._id;
                Async.auto({       //setupallapps
                    setupallapps:(dones) => { csyberUser.setupallapps(dones)},
                    installcsyber: ['setupallapps', function (Results, dones) {
                                csyberUser.installallapps(id, "restricted",dones)
                                   // dones(null, result) 
                                //surgbc@gmail.com
                    }],
                   //clean1:(dones) => { UserModel.remove().exec().then(function(docs, err){dones(err, docs)});},
                   //clean2:(dones) => { AppModel.remove().exec().then(function(docs, err){dones(err, docs)});},
                   //clean3:(dones) => { GroupModel.remove().exec().then(function(docs, err){dones(err, docs)});}
                }, done);
                
            }],
            guestEmail: ['AddUsertoRootUsers', (results, done) => {
                done(null ,Config.get("/guestemail"))
            }],
            guestPassword: ['guestEmail', (results, done) => {
                done(null ,Config.get("/guestemail"))
            
            }],
            setupGuestUser: ['guestPassword', (results, done) => {

                Async.auto({
                      connect: function (done) {
                        // const db = 'mongodb://localhost:27017/'+Config.get("/database/name");
                        // mongoose.connect(db, {}, done);
                       done();
                    },
                    User:  ["connect", function (dbResults, done) {
                                const username = results.guestEmail.toLowerCase();
                                const password = results.guestPassword;
                                const email = results.guestEmail.toLowerCase();
                                csyberUser.create(username, password, {email:email,name:{first:"Guest", middle:""}},  function(err, result){done(err, result) });
                    }],
                    AddUsertoRootUsers: ['User', function (dbResults, done) { 
                        let app = "csyber";
                        const id = dbResults.User._id;
                        Async.auto({
                            setupallapps:(dones) => { csyberUser.setupallapps(dones)},
                            installcsyber: ['setupallapps', function (Results, dones) {
                                        csyberUser.installallapps(id, "free",dones)
                                          //  dones(null, Results)     
                            }],
                        }, done);
                        
                    }],
                    
                    
                }, (err, dbResults) => {

                    if (err) {
                        // console.error('Failed to setup root user.');
                        return done(err);
                    }

                    done(null, true);
                });
            }]
            
            
        }, (err, dbResults) => {

            if (err) {
                // console.error('Failed to setup root user.');
                return done(err);
            }

            done(null, true);
        });
    }]

}, (err, results) => {

    if (err) {
        // console.error('Setup failed.');
        // console.error(err);
        return process.exit(1);
    }

    // console.log('Setup complete.');
    process.exit(0);
});