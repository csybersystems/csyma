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
    name:"vipimo",
    displayname:"vipimo",       // || or false   
	url:"vipimo/index",
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
         dashboards:{
            "root":{
                dashboards: {
                class: "fa fa-dashboard",
                dashboards: {
                    users:{
                        name: "Users",
                        url: "#csyber/dashboards/home",
                        application:"Users"
                    },
                    profile:{
                        name: "Profile",
                        url: "#csyber/dashboards/home",
                        application:"profile"
                    },
                    applications:{
                        name: "Applications",
                        url: "#csyber/dashboards/home",
                        application:"Applications"
                    }
                },
            },
            },
            "user":{
                dashboards: {
                // class: "fa fa-dashboard",
                // dashboards: {
                //     profile:{
                //         name: "Profile",
                //         url: "#csyber/dashboards/home",
                //         application:"Profile"
                //         },
                //     applications:{
                //         name: "Applications",
                //         url: "#csyber/dashboards/home",
                //         application:"applications"
                //         }
                //     },
                },
            },
            "nobody":{
                dashboards: {
                class: "fa fa-dashboard",
                dashboards: {
                    profile1:{
                        name: "Profile 1",
                        url: "#csyber/dashboards/home",
                        application:"Profile"
                        },
                    applications:{
                        name: "Applications",
                        url: "#csyber/dashboards/home",
                        application:"applications"
                        }
                    },
                },
            },
       
        },
        others:
                {
                    hymnals:
                        {
                            class:"fa fa-book",
                            url: "#",
                            name:"Hymnals",
                             children:
                            {
                                english:{
                                    name: "SDAH",
                                    url: "hymnal/home/h/k",
                                    application:"SDAH",
                                    class:"fa fa-book",
                                    },
                                kiswahili:{
                                    name: "NZK",
                                    url: "hymnal/home/h/e",
                                    application:"NZK",
                                    class:"fa fa-book",
                                    }
                            },
                        },
                    // english:
                    //     {
                    //         class:"fa fa-book",
                    //         url: "/hymnal/home/h/k",
                    //         name:"SDAH",
                    //     },
                    // kiswahili:
                    //     {
                    //         class:"fa fa-book",
                    //         url: "/hymnal/home/h/e",
                    //         name:"NZK",
                            
                    //     }
                    
                },
        defaultpage: "hymnal/hymnalhome", 
        keywords:"keywords"
    }
   

};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
