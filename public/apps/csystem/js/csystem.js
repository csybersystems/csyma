$(document).ready(function()
{
	///
	loadpreviousapp();
})

var csyberlocation = "";
var csyberstack = [];/////////////////use this to go back...,,,...,,,....
var maxstacklen = 10;
var currentapp = null;

var errorhandler = function()
{

}

var loadpreviousapp = function()
{
	if(errpage === true)  //nothing to be done if is 404/500, etc
	{
		errpage = false;
		return;
	}
	var prevapp = window.location.href.match(/#!(.*?)(\/)/);
	if(prevapp == null)prevapp = window.location.href.match(/#!(.*?)/);
	if(prevapp == null){
		prevapp = {0:"",1:"csystem"};
		csyberlocation = window.location.href+"#csyber"
	}else csyberlocation = window.location.href;
	console.log(prevapp)
	alertify.success("...");
	if(prevapp[1] != undefined)prevapp = prevapp[1];
	else prevapp = "csyber"
	prevapp += "app";
	let obj = "#"+prevapp

	if($(obj).html() == undefined){
		obj = $("#csyberapp")
		window.location.href = "#csyber"
	}
	try
	{
		$(obj).click();
		$(".applicationsicon").click();
	}catch(err)
	{
		console.log(err)
	}
}


var attachUserForm = function() {
    $("body").on('renderSuccess.ufModal', function (data) {
        var modal = $(this).ufModal('getModal');
        var form = modal.find('.js-form');

        // Set up any widgets inside the modal
        form.find(".js-select2").select2({
            width: '100%'
        });

        // Set up the form for submission
        form.ufForm({
            validators: page.validators
        }).on("submitSuccess.ufForm", function() {
            // Reload page on success
            window.location.reload();
        });
    });
}


var loadapp = function(obj)
{
	let appname = $(obj).attr("content")
	console.log("content..."+appname)
	let newurl = $(obj).attr("href")
	let objtype = $(obj).attr("type")
	let url = window.location.href;
	//console.log("In csyber.js: all apps now reloading if reopened. Loading scripts also. Is this proper???? Choose mode in which to work");
	
	//applications will load scripts
	//
	console.log(objtype)
	if(objtype == "app")
	{
		//load page
		var tmpurlroot = newurl.replace("#", "apps/?app=");
		var tmpurl = tmpurlroot+"&action=loadpage";
		$(".applicationsicon").click();
		console.log("here...")
		$.get( tmpurl).done(function( data ) {

			var iserror;
			try{
				let datap = JSON.parse(data)		//if error, data will come as JSON 
				iserror = true;
				if(datap.code != undefined)alertify.error(datap.code);
				else alertify.error(data);
			}catch(error)
			{
				iserror = false;
			}
		  	if(iserror === false)
		  	{




/*
		  		$("body").ufModal({
            sourceUrl: "http://localhost:3000/apps/?app=csyber&action=loadpage&page=sampleform",
            msgTarget: $("#alerts-page")
        });

        attachUserForm();

*/


		  		
		  		let tmpurli = tmpurlroot+"&action=loaddashboards";
		  		$.get(tmpurli).done(function(innerdata){
		  			let datapi;
		  			try{
						datapi = JSON.parse(innerdata)		//if error, data will come as JSON 
						iserror = false;
						console.log(datapi)
						console.log(innerdata)
						$(".thisapp").html(appname);
  						$(".content").html(data);
  						console.log("........................data")
  						console.log(data)
  						$(".dashboardscontainer").html('<a href="#"></a>')
  						for(let dashboard in datapi.dashboards.dashboards)
  						{
  							console.log(dashboard)
  							console.log(datapi.dashboards.dashboards)
  							console.log(datapi.dashboards.dashboards[dashboard])
  							$(".dashboardscontainer").append('<li><a href="#"></a><a class = "sidea" href="/'+datapi.dashboards.dashboards[dashboard].url+'" content="'+datapi.dashboards.dashboards[dashboard].name+'" type="dash"><i class="fa fa-circle-o"></i> '+datapi.dashboards.dashboards[dashboard].name+'</a></li>');
  						}
  						//
					}catch(error)
					{
						alertify.error("Unkown error while loading dashboards");
						iserror = true;
					}
		  			
		  		}).fail(function(){
		  			alertify.error("Failed to load dashboards.");
		  		});

		  		let tmpurli1 = tmpurlroot+"&action=loadscripts";
		  		$.get(tmpurli1).done(function(innerdata){
		  			let datapi1;
		  			try{
						datapi1 = JSON.parse(innerdata)
						iserror = false;
						console.log(innerdata)
  						/*for(let scriptindex in datapi1)
  						{
  							$(".dashboardscontainer").append('<script src="/apps/'+appname+'/js/'+datapi1[scriptindex]+'.js"></script>');
  						}
  						$(".dashboardscontainer").append('<script>$(".sidea").click(function(){loadapp($(this))})</script>');
  						*/
  						let scripts = {}
  						for(let scriptindex in datapi1)scripts[datapi1[scriptindex]] = datapi1[scriptindex];
  						console.log(scripts)
  						for(let scriptindex in scripts)
  						{
  							$(".dashboardscontainer").append('<script src="/apps/'+appname+'/js/'+scripts[scriptindex]+'.js"></script>');
  						}
  						$(".dashboardscontainer").append('<script>$(".sidea").click(function(){loadapp($(this))})</script>');


  						//
					}catch(error)
					{
						alertify.error("Unkown error while loading dashboards");
						iserror = true;
						$(".dashboardscontainer").append('<script>$(".sidea").click(function(){loadapp($(this))})</script>');
					}
		  			
		  		}).fail(function(){
		  			alertify.error("Failed to load dashboards.");
		  		});
				
		  	}
		}).fail(function(err){
			alertify.error("Unknown error. Please try again later or contact the administrator.");
		});

		
	}
	else if(objtype == "dash"){
		$(".thisdashboard").html(appname);
		$(".dashboardsicon").click();
		var prevapp = window.location.href.match(/#(.*?)(\/)/);
		if(prevapp == null)prevapp = window.location.href.match(/#(.*?)/);
		if(prevapp == null){
			prevapp = {0:"",1:"csyber"};
			csyberlocation = window.location.href+"#csyber"
		}else csyberlocation = window.location.href;
	
		console.log("csyberlocation")
		console.log(csyberlocation)
		var tmpurl = csyberlocation+"&action=loadpage&page="+appname;
		console.log("here...")
		console.log(tmpurl)
		tmpurl = tmpurl.replace("#", "apps/?app=");
		console.log(tmpurl)
		$.get( tmpurl).done(function( data ) {
			var iserror;
			try{
				let datap = JSON.parse(data)		//if error, data will come as JSON 
				iserror = true;
				if(datap.code != undefined)alertify.error(datap.code);
				else alertify.error(data);
				$(".dashboardscontainer").append('<script>$(".sidea").click(function(){loadapp($(this))})</script>');
			}catch(error)
			{
				iserror = false;
			}
		  	if(iserror === false)
		  	{
		  		
  				$(".content").html(data);	
  				$(".dashboardscontainer").append('<script>$(".sidea").click(function(){loadapp($(this))})</script>');	
  				addtostack(tmpurl);	
		  	}
		}).fail(function(err){
			alertify.error("Unknown error. Please try again later or contact the administrator.");
		});
	}
}


var applists = function(obj)
{
	console.log("applists")
	let newurl = $(obj).attr("href").replace("#", "apps/?app=");
	currentapp = $(obj).attr("href").replace("#", "");
	let tmpurl = newurl+"&action=appmanager";
	console.log(tmpurl)
	$.get(tmpurl).done(function(innerdata){
		let datapi;
		console.log(innerdata)
		try{
			try
			{
				datapi = JSON.parse(innerdata)		//if error, data will come as JSON 
				if(datapi.code != undefined)alertify.error(datapi.code);
				if(datapi.err != undefined)alertify.error(datapi.err);
			}catch(error)
			{
				$(".content").html(innerdata);
				addtostack(tmpurl);
			}
			
		}catch(error)
		{
			alertify.error("Unkown error occured");
			iserror = true;
		}
		
	}).fail(function(){
		alertify.error("Failed to load.");
	});

}

var addtostack = (entry)=>{
	let allstack = [];
	if(csyberstack.length == maxstacklen)
	{
		let stackitem;
		while(csyberstack.length > 0)
			allstack.push(csyberstack.pop())
		allstack.pop()		//remove first saved item
		while(allstack.length > 0)
			csyberstack.push(allstack.pop())


	}
	csyberstack.push(entry)
	console.log(csyberstack.length)
}
var loadlastpage = () => {
	csyberstack.pop();
	console.log(csyberstack)
	console.log("in....load last page")
	let url = csyberstack.pop();
	console.log(url)
	$.get(url).done(function(innerdata){
		let datapi;
		console.log(innerdata)
		try{
			try
			{
				datapi = JSON.parse(innerdata)		//if error, data will come as JSON 
				if(datapi.code != undefined)alertify.error(datapi.code);
				if(datapi.err != undefined)alertify.error(datapi.err);
			}catch(error)
			{
				console.log("error occured,, will reaload")
				$(".content").html(innerdata);
				addtostack(url);
			}
			
		}catch(error)
		{
			alertify.error("Unkown error occured");
			iserror = true;
		}
		
	}).fail(function(){
		alertify.error("Failed to load.");
	});

}

var installapp = (action) =>{
	console.log(currentapp)
	let url = "";
	if(action == "uninstall")
		url = "apps/?app="+currentapp+"&action="+action;
	else
		url = "apps/?app="+"csyber"+"&action="+action+"&add="+currentapp;
	console.log(url)
	sendrequest(url, true, function(result){
		if(result === true)
		{
			loadapplicationslist()
		}
	});
	
}

var unlinkaccounts = (app) => {
	let url = "apps/?app=csyber&action=unlinkaccounts&account="+app;
	url = url.replace("#", "");
	sendrequest(url)
}

var sendrequest = (url, goback, callback) => {
	console.log(url)
	$.get(url).done(function(innerdata){
		let datapi;
			console.log(typeof innerdata)
			console.log(innerdata)
			try{
			if(typeof innerdata != "object")
				datapi = JSON.parse(innerdata);
			else datapi = innerdata;
			console.log("is datapi...")
			console.log(datapi)
			if(datapi.err != undefined)
			{
				alertify.error(""+datapi.err)
				callback(false);
			}
			else 
				if(datapi.msg != undefined){
					alertify.success(""+datapi.msg)
					if(goback ===true)loadlastpage();
					callback(true);
				}
				else {
					alertify.error("Unkown error in result. Please try again.")
					callback(false);
				}
		}catch(error)
		{
			console.log(innerdata)
			alertify.error("Unkown error while making request.");
			callback(false);
		}
		
	}).fail(function(err){
		console.log("There is an error....")
		alertify.error("Error while making request.");
		callback(false);
	});
}

var loadapplicationslist = () => {
	let url = "apps/?app=csyber&action=loadapplications";
	$.get(url).done(function(innerdata){
		let datapi;
		console.log(typeof innerdata)
		console.log(innerdata)
		try{
		if(typeof innerdata != "object")
			datapi = JSON.parse(innerdata);
		else datapi = innerdata;
		console.log("is datapi...")
		console.log(datapi)
		if(datapi.err != undefined)
		{
			alertify.error(""+datapi.err)
		}
		else 
		{
			let app;
			$(".appscontainer").html('<a href="#"></a>')
			while(app = datapi.pop())
			{
				console.log(app.name+""  +app.url)
				$(".appscontainer").append('<li><a href="#"></a><a class = "sidea" href="/'+app.url+'" content="'+app.name+'" type="app" id="'+app.name+'app"></i> '+app.name+'</a></li>');
			}
		}
		}catch(error)
		{
			alertify.error("Unkown error while making request.");
		}
		
	}).fail(function(err){
		alertify.error("Error while making request.");
	});
}
//loading applications from applications menu
$(".sidea").click(function(){loadapp($(this))});