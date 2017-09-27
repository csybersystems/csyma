'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({ silent: false });

const criteria = {
    env: process.env.NODE_ENV
};


const config = {
	results:{
        10:"App built successfully. You can now test it",
        11:"Account has been unlinked",
        12:"Application has been uninstalled",
        13:"Application has been installed",
        14:"Group has been added",
        15:"Group has been removed"
    },
    name:"csymaconstruction",
    displayname:false,//"csyma construction",       // || or false failse if it should not be shown in app list
	url:"csymaconstruction/app/elements",
	enabled: {
        root:"restricted",
        user:"free",
        nobody:"free"
    },
    "uninstall":
    {
        root:false,
        user:false,
        nobody:false
    },
    "dropgroups":
    {
        root:
            {
                me:false,
                root:true,
                user:false,
                nobody:true,
            },
        user:{
                me:false,
                root:false,
                user:false,
                nobody:true,
            },
        nobody:{
                me:false,
                root:false,
                user:false,
                nobody:true,
            }
    },
	"free":  {
		groups:{
			user:"user",
            nobody:"nobody"
		}
	},
	"restricted":  {
		groups:{
			admin:"root",
			user:"user",
            nobody:"nobody"
		}
	},
    "dos":  {
        groups:{
            dos:"dos",
            user:"user",
            nobody:"nobody"
        }
    },
    actions:
    {
    	"install":{
    		groups:{
    			root:"root"
    		}
    	}
    },
    scripts:{
    	"root":{
    		0:"root"

    	},
    	"user":{
    		0:"user",
    		1:"shared"

    	}
    },
    elements:{
         
        others:{
                about:
                    {
                        class:"fa fa-book",
                        url: "/hymnal/home/h/k",
                        name:"About",
                    },
                getstarted:
                    {
                        class:"fa fa-book",
                        url: "/hymnal/home/h/e",
                        name:"Get Started",
                        
                    },
        },
        
        defaultpage: "apps/csymaconstruction/csymaconstruction", 
        keywords:"keywords...",
        description:"description...is description"
    }

};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
