'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({ silent: false });

const criteria = {
    env: process.env.NODE_ENV
};

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

const config = {
    $meta: 'This file configures the plot device.',
    title: 'CSYBER',
    name:"csyma",                       //name of this instance of csyma
    company: 'CSYBER SYSTEMS',
    builder:
    {
        buildcompany: 'CSYBER SYSTEMS',             //who built app?. shown in footer
        buildcompanyurl: '/',
        facebook:"http://fb.com/csybersystems",
        github:"http://github.com/csybersystems",
        twitter:"http://ftwitter.com/csybersystems",
    },
    companyurl: '#',
    applogoref: '#',
    rooturl: '/',
    urls:
    {
        "login":"",
        "left":"",

    },
    appwebsite: '#',
    appname: 'CSYBER',
    defaulpageloggedout: 'apps/csystem/welcome',
    defaulpageloggedin: 'apps/csystem/welcome',//'/auth/login',
    
    displayappname: 'CSYMA Apps',      //appears on login page
    year: year,
    applogoname: 'CSWEEPER',      //appears on top left
    teamname: 'SSPOC Team',
    version: "1.1",
    skin:{
        root:"skin-red",
        siteadmin:"skin-purple",
        siteuser:"skin-blue",
    },
    database:{
        name:process.env.MONGODB,
        uri:process.env.MONGODB_URI,
    },
    author:"Brian Onang'o",
    adminemail:"postmaster@gospelsounders.org",
    guestemail:"guest@cseco.co.ke",
    authorurl:"https://github.com/surgbc",
    description:"Control your IoT devices, LoRa devices, automate your house, home, farm, kitchen using this dashboard, platform. Use this dashboard to visualize your data",
    elements:
    {
        keywords:"keywords go here",
        description:"Descrition goes here",
        defaultapp: false,
        // defaultapp: 'csyma',//'construction',
        // defaultapp: 'csymaconstruction',//'construction',
        
    },
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            production: process.env.PORT,
            $default: 8000
        }
    },
    baseUrl: {
        $filter: 'env',
        $meta: 'values should not end in "/"',
        production: 'https://getaqua.herokuapp.com',
        $default: 'http://127.0.0.1:8000'
    },
    authAttempts: {
        forIp: 50,
        forIpAndUser: 7
    },
    cookieSecret: {
        $filter: 'env',
        production: process.env.COOKIE_SECRET,
        $default: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!'
    },
    hapiMongoModels: {
        mongodb: {
            uri: {
                $filter: 'env',
                production: process.env.MONGODB_URI,
                test: 'mongodb://localhost:27017/aqua-test',
                $default: 'mongodb://localhost:27017/aqua'
            }
        },
        autoIndex: true
    },
    nodemailer: {
        host: 'mail.adhrc.co.ke',
        port: 25,
        secure: false,
        auth: {
            user: 'jkusda@adhrc.co.ke',
            pass: process.env.SMTP_PASSWORD
        }
    },
    system: {
        fromAddress: {
            name: 'Vipimo',
            address: 'surgbc@gmail.com'
        },
        toAddress: {
            name: 'Vipimo',
            address: 'surgbc@gmail.com'
        }
    },
    endpoints: {
        home: {
                GET: {
                    home:"http://localhost:3000/"
                }
        },
        apps: {
            GET: {
                endpoints:"http://localhost:3000/apps",
                loadapp:{
                    url: "http://localhost:3000/apps",
                    data:{
                        app:"appname"
                    }
                }
            },
            POST: {
            },
        },
        auth: {
            GET: {
                endpoints:"http://localhost:3000/auth",
                login:"http://localhost:3000/auth/login",
                loginlocal:"http://localhost:3000/auth/loginlocal",
                loginfacebook:"http://localhost:3000/auth/facebook",
                logingoogle:"http://localhost:3000/auth/google",
                logintwitter:"http://localhost:3000/auth/twitter",
                signup:"http://localhost:3000/auth/signup",
                reset:"http://localhost:3000/auth/reset",
                reset:"http://localhost:3000/auth/logout"
            },
            POST: {
                login:"http://localhost:3000/auth/login",
                signup:"http://localhost:3000/auth/signup",
                reset:"http://localhost:3000/auth/reset"
            },
        },
        admin: {
            GET: {
                endpoints:"http://localhost:3000/admin",
                dashboard:"http://localhost:3000/admin/dashboard"
            },
        },
        account: {
            GET: {
                endpoints:"http://localhost:3000/account"
            },
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
