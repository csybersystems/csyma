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
    name:"csyma",
    displayname:"csyma",       // || or false   
	url:"csyma/",
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
    class:"fa fa-cog",        //fa fa-cog fa-spin fa-3x fa-fw     //icon that appears for app in menu...
    elements:{
        others:{
                "user":                 //this is the user...
                {

                    "sections":
                    {
                        class:"fa fa-reorder",
                        url:"#",
                        name:"Sections",
                        children:
                        {
                            users:{
                                name:"Users",
                                url:"#!/csyma/page/csyma/users",
                                application:"app page",
                                class:"fa fa-user",
                                classi:"csection",
                                type:"app",

                            },
                            organizations:{
                                name:"Organizations",
                                url:"#!/csyma/page/csyma/organizations",
                                application:"app page",
                                class:"fa fa-tv",
                                classi:"csection",
                                type:"app",

                            },
                            apps:{
                                name:"Apps",
                                url:"#!/csyma/page/csyma/apps",
                                application:"app page",
                                class:"fa fa-pencil",
                                classi:"csection",
                                type:"app",

                            },
                            
                        },
                        
                    },
                    "dashboards":
                    {
                        class:"fa fa-dashboard",
                        url:"#",
                        name:"Dashboards",
                        children:
                        {
                            users:
                            {
                                name:"Users",
                                url:"#!/csyma/page/csyma/users",
                                application:"app page",
                                class:"fa fa-user",
                                classi:"csection",
                                type:"app"
                            },
                            user_apps:
                            {
                                name:"Apps",
                                url:"#!/csyma/section/csyma/apps",
                                application:"app page",
                                class:"fa fa-tv",
                                classi:"csection",
                                type:"app"
                            },
                        },
                        
                    }
                    
                },
                "nobody":
                {
                    
                },
        },
        csections:  //keyword.      //extends the main section (others) for recursive child elements
        {
            "user":
            {
                "users":
                {
                    create:
                    {
                        name: "New User",
                        url: "#",
                        application:"NZK",
                        class:"fa fa-fw fa-user-plus text-success",
                        classi:"csectionp tocreateuser",

                    },
                    defaultpage:"csyma/sections/site/site_home",
                },
                "organizations":
                {
                    create:
                    {
                        name: "New Organization",
                        url: "#",
                        class:"fa fa-fw fa-user-plus text-success",
                        classi:"csectionp tocreateorg",

                    },
                    defaultpage:"csyma/sections/site/site_home",
                },
                "site":
                {
                    user_doc:
                    {
                        name: "DOCUMENTATION",
                        url: "#!/csyma/section/csyma/documentation",
                        application:"NZK",
                        class:"fa fa-book",
                        classi:"csection",

                    },
                    defaultpage:"csyma/sections/site/site_home",
                    pages:
                    {
                        name: "Pages",
                        url: "#",
                        class:"fa fa-book",
                        classi:"csection",
                        children:
                        {
                             user_site:
                            {
                                name:"Site",
                                url:"#!/csyma/section/csyma/site",
                                application:"app page",
                                class:"fa fa-tv",
                                classi:"csection",
                            },
                             user_about:
                            {
                                name:"About",
                                url:"#!/csyma/section/csyma/about",
                                application:"app page",
                                class:"fa fa-info-circle",
                                classi:"csection",
                            },
                            user_doc:
                            {
                                name: "Documentation",
                                url: "#!/csyma/section/csyma/documentation",
                                application:"NZK",
                                class:"fa fa-book",
                                classi:"csection",
                            }
                        }
                    }
                }
                // ,"csyma_profile":
                // {
                //     user_doc:
                //     {
                //         name: "DOCUMENTATION1",
                //         url: "#!/csyma/section/csyma/documentation",
                //         application:"NZK",
                //         class:"fa fa-book",
                //         classi:"csection",

                //     },
                //     level:2,
                //     defaultpage:"csyma/sections/site/site_home",
                //     pages1:
                //     {
                //         name: "Pages1",
                //         url: "#",
                //         class:"fa fa-book",
                //         classi:"csection",
                //         children:
                //         {
                //              user_site:
                //             {
                //                 name:"Site1",
                //                 url:"#!/csyma/section/csyma/site",
                //                 application:"app page",
                //                 class:"fa fa-tv",
                //                 classi:"csection",
                //             },
                //              user_about:
                //             {
                //                 name:"About1",
                //                 url:"#!/csyma/section/csyma/about",
                //                 application:"app page",
                //                 class:"fa fa-info-circle",
                //                 classi:"csection",
                //             },
                //             user_doc:
                //             {
                //                 name: "Documentation1",
                //                 url: "#!/csyma/section/csyma/documentation",
                //                 application:"NZK",
                //                 class:"fa fa-book",
                //                 classi:"csection",
                //             }
                //         }
                //     }
                // },

            }
        },
        defaultpage: "csyma/csymahome_default",        //you should change this after installation 
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
