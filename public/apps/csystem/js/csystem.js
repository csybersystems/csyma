/*
 * configurations. Should go elsewhere
 */
//const default_app = "csyma";
const rootpath = "";				/*What would resolve to this app if proxy were used? */
const pathsep = "#!"

$(document).ready(function()
{
	///
	loadpreviousapp();
	initmodals();
})

var csyberlocation = "";
var csyberstack = [];/////////////////use this to go back...,,,...,,,....
var maxstacklen = 10;
var currentapp = null;
var errpage =false;

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
	var prevapp;
	// prevapp = window.location.href.match(/#(.*?)(\/)/);
	// console.log(prevapp)
	// if(prevapp == null)prevapp = window.location.href.match(/#(.*?)/);
	prevapp = window.location.href.split(pathsep);
	delete prevapp[0];
	prevapp = prevapp.join("")
	// console.log(prevapp)
	if(prevapp === ""){									//no previous running app
		console.log("defaulapp:"+default_app)
		
		try
		{
			if(default_app === false)throw new error("no default app set");
			prevapp = default_app

		}catch(error)
		{
			//nothing to be done
			//alertify.error("error getting default app")
			return;
		}
		
	}
	try
	{
		// console.log(prevapp)
		let obj = "#"+prevapp+"app";
		// console.log(prevapp)
		// console.log($(obj).html())
		try
		{
			if($(obj).html() == undefined)throw new error("obj.html")
				//window.location.href =pathsep+prevapp;
			$(obj).click();

			$(".applicationsicon").click();
		}catch(err)
		{
			loadapp(pathsep+prevapp)
			$(".applicationsicon").click();
			//console.log(err)
		}
	}catch(err)
	{ 

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

var loadpage = function(url)
{
	//.sidea
	let url_r = url;
	url_r = url_r.split(pathsep);
	delete url_r[0];
	url_r = url_r.join("");
	// window.location.href = rootpath+pathsep+url_r

	url = rootpath+url_r+"?headless=true&accepts=html"			//first load the page
	console.log("loadpage()")
	console.log(url)
	$.get(url).done(function(preinnerdata){
		console.log("be called..............")
		$(".content").remove();			//remove previously attached scripts...
		$(".content-wrapper").html("<div class='content'></div>");
		// console.log(preinnerdata)
		$(".content").html(preinnerdata);
	}).fail(function(){
		alertify.error("Failed to load page.");
	});
}

var loadapp = function(url, skipclicking)
{
	let url_r = url;
	url_r = url_r.split(pathsep);
	delete url_r[0];
	url_r = url_r.join("");
	window.location.href = rootpath+pathsep+url_r
	url = rootpath+url_r+"?headless=true&accepts=json"
	console.log(url)

	url = rootpath+url_r+"?headless=true&accepts=html"			//first load the page
	console.log(url)
	$.get(url).done(function(preinnerdata){
	

		//console.log(innerdata)
		url = rootpath+url_r+"?headless=true&accepts=json"
		$.getJSON(url).done(function(innerdata){
			console.log(innerdata)
			let datapi1;
			try{
				let dashboards = innerdata.dashboards
				console.log(dashboards)
				let elem;
				let d_class = dashboards.class;

				$(".otherstree").html('');
				$( ".sectionscontainer").html( "");
				$(".dashtree").attr("style","display:none")

				console.log("now loading dashboards")
				console.log(dashboards.dashboards)

				for(elem in dashboards.dashboards)
				{
					$(".dashboardscontainer").html('');
					$(".dashtree").attr("style","display:block").html("")
					break;
				}
				
				for(elem in dashboards.dashboards)
				{
					let element = dashboards.dashboards[elem]
					// console.log(element)
					$(".dashboardscontainer").append('<li><a href="#"></a><a class = "sidea" href="/'+element.url+'"type="dash"><i class="'+element.class+'"></i> '+element.name+'</a></li>');
				}
				if(!skipclicking) $(".applicationsicon").click();
				// $(".dashboardsicon").click();

				$(".otherstree").detach();
				let others = innerdata.others;
				console.log(others)
				let level = innerdata.level||"1";
				for(elem in others)
				{
					$("."+elem+"container").html("")
					let element = others[elem]
					if(element.children !== undefined)
					{
						newelem = $( '<li class="treeview otherstree"><a href="#"><i class="'+element.class+' '+elem+'icon"></i> <span>'+element.name+'</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a><ul class="treeview-menu '+elem+'container menu-open" style="display: block;"></ul></li>' )
						$( ".leftsidebarcontainer").append( newelem);
						let inneritem;
						for(inneritem in element.children)
						{
							let element_i = element.children[inneritem]
							// console.log(element_i)
							let tmp = element_i.classi||"sidea";

							let tmptype = element_i.type===undefined?"page":element_i.type;
							$("."+elem+"container").append('<li><a href="#"></a><a class = "'+tmp+'" href="/'+element_i.url+'" type="'+tmptype+'"'+'" level="'+level+'"><i class="'+element_i.class+'"></i> '+element_i.name+'</a></li>');
						}
						$("."+elem+"icon").click();
					}
					else 
					{
						let tmptype = element.type===undefined?"page":element.type;
						let tmp = element.classi||"sideb";
						newelem = $( '<li class="treeview otherstree"><a class = "'+tmp+'"href="'+element.url+'" type="'+tmptype+'"'+'" level="'+level+'"><i class="'+element.class+' '+elem+'icon"></i> <span>'+element.name+'</span></a><ul class="treeview-menu dashboardscontainer menu-open" style="display: block;"></ul></li>' )
						$( ".leftsidebarcontainer" ).append( newelem);
					}

					
					
				}

				$(".lfbclevel1").detach();
				$( ".leftsidebarcontainer").append("<span class = 'lfbclevel1 sidebar-menu'></span>")
				if(innerdata.title !== undefined)
				{
					document.title = appname+" | "+innerdata.title;
				}
				if(innerdata.keywords !== undefined)
					$('meta[name="keywords"]').attr("content", innerdata.keywords);
				if(innerdata.description !== undefined)
					$('meta[name="description"]').attr("content", innerdata.description);
				if(innerdata.app !== undefined)
					$(".thisapp").html('<i class="fa fa-desktop"></i>'+innerdata.app);
				if(innerdata.section !== undefined)
					$(".thissection").html(innerdata.section);	
				if(innerdata.subsection !== undefined)
					$(".thisdashboard").html(innerdata.subsection);
			$(".content").html(preinnerdata);
		}catch(error)
		{
			alertify.error("Unkown error while loading application");
			
		}
		}).fail(function(){
			alertify.error("Failed to load application.");
			$(".applicationsicon").click();
		});
		
	}).fail(function(){
		$(".applicationsicon").click();
		alertify.error("Failed to load page.");
	});
	
	
	
}

var loadsection = function(url, obj)
{
	/*

		load app or just a single page...
			an app will have more components attached to it....
	*/
	let i;

	let level = obj.attr("level");

	switch(obj.attr("type"))
	{
		case "app":			
			break;
		default:
			loadpage(url);
			console.log(url)
			$(obj).parent().parent().parent().children("a").click();
			return;		//stop at this point.

	}
	// return;
	let url_r = url;
	url_r = url_r.split(pathsep);
	delete url_r[0];
	url_r = url_r.join("");
	window.location.href = rootpath+pathsep+url_r
	url = rootpath+url_r+"?headless=true&accepts=json"
	
	url = rootpath+url_r+"?headless=true&accepts=html"			//first load the page
	console.log(url)
	$.get(url).done(function(preinnerdata){
		url = rootpath+url_r+"?headless=true&accepts=json"
		$.getJSON(url).done(function(innerdata){
			// console.log(innerdata)

			

			////////////////////loading child elements....

			let datapi1;
			try{
				let others = innerdata.csections;
				let i;
				let level = innerdata.level||"1";
				console.log(innerdata)
				for(i in innerdata)console.log(i)
					console.log(innerdata.level)
				let childelem = childsection(level)
				$(childelem).html("");
				for(elem in others)
				{
					$("."+elem+"container").html("")
					let element = others[elem]
					if(element.children !== undefined)
					{
						newelem = $( '<li class="treeview sectiontree"><a href="#"><i class="'+element.class+' '+elem+'icon"></i> <span>'+element.name+'</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a><ul class="treeview-menu '+elem+'container menu-open" style="display: block;"></ul></li>' )
						// $( ".lfbclevel1").append( newelem);
						childelem.append( newelem);
						let inneritem;
						for(inneritem in element.children)
						{
							let element_i = element.children[inneritem]
							let tmp = element_i.classi||"sidea"+" "+elem+'icon';
							let tmptype = element_i.type===undefined?"page":element_i.type;
							$("."+elem+"container").append('<li><a href="#"></a>  <a class = "'+tmp+'" href="/'+element_i.url+'"type="'+tmptype+'"><i class="'+element_i.class+'"></i> '+element_i.name+'</a>  </li>');
						}
						$("."+elem+"icon").click();

					}
					else 
					{
						if(element.name !== undefined)
						{
							let tmp = element.classi||"sidea";
							newelem = $( '<li class="treeview sectiontree"><a class = "'+tmp+'" href="'+element.url+'"><i class="'+element.class+' '+elem+'icon"></i> <span>'+element.name+'</span></a><ul class="treeview-menu dashboardscontainer menu-open" style="display: block;"></ul></li>' )
							// $( ".lfbclevel1" ).append( newelem);
							childelem.append( newelem);
						}
					}	
					
				}



				// if(innerdata.title !== undefined)
				// {
				// 	document.title = appname+" | "+innerdata.title;
				// }
				// if(innerdata.keywords !== undefined)
				// 	$('meta[name="keywords"]').attr("content", innerdata.keywords);
				// if(innerdata.description !== undefined)
				// 	$('meta[name="description"]').attr("content", innerdata.description);
				// if(innerdata.app !== undefined)
				// 	$(".thisapp").html('<i class="fa fa-desktop"></i>'+innerdata.app);
				// if(innerdata.section !== undefined)
				// 	$(".thissection").html(innerdata.section);	
				// if(innerdata.subsection !== undefined)
				// 	$(".thisdashboard").html(innerdata.subsection);
			$(".content").html(preinnerdata);
			$(obj).parent().parent().parent().children("a").click();
		}catch(error)
		{
			alertify.error("Unkown error while loading application");
			
		}
		}).fail(function(){
			alertify.error("Failed to load application.");
			$(obj).parent().parent().parent().children("a").click();
		});
		
	}).fail(function(){
		$(obj).parent().parent().parent().children("a").click();
		alertify.error("Failed to load page.");
	});
	
	
	
}


var childsection = function(level)
{
	console.log(level)
	level = parseInt(level)
	if(level === 1)
		return $(".lfbclevel"+level);

	let prelevel = level-1;
	$(".lfbclevel"+level).detach();
	$( ".lfbclevel"+prelevel).append("<span class = 'lfbclevel"+level+" sidebar-menu'></span>");
	return $(".lfbclevel"+level);

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
				// console.log("error occured,, will reaload")
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

var unlinkaccounts = (socialaccount) => {
	let url = "/auth/unlink/"+socialaccount;
	url = url.replace("#", "");
	postrequest(url, false, function(err){})
}

var postrequest = (url, goback, callback) => {
	console.log(url)
	$.post(url).done(function(innerdata){
		let datapi;
			console.log(typeof innerdata)
			// console.log(innerdata)
			try{
			if(typeof innerdata != "object")
				datapi = JSON.parse(innerdata);
			else datapi = innerdata;
			// console.log("is datapi...")
			// console.log(datapi)
			if(datapi.err != undefined)
			{
				alertify.error(""+datapi.err)
				if(datapi.redirect)
					setTimeout(function(){window.top.location.href = datapi.redirect;},3000);
				callback(false);
			}
			else 
				if(datapi.msg != undefined){
					alertify.success(""+datapi.msg)
					if(datapi.redirect)
						setTimeout(function(){window.top.location.href = datapi.redirect;},3000);
  						
					if(goback ===true)loadlastpage();
					callback(true);
				}
				else {
					alertify.error("Unkown error in result. Please try again.")
					callback(false);
				}
		}catch(error)
		{
			// console.log(innerdata)
			alertify.error("Unkown error while making request....");
			callback(false);
		}
		
	}).fail(function(err){
		console.log("There is an error....")
		alertify.error("Error while making request.");
		callback(false);
	});
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



$(".presignupbtn").click(function(){

	presignupbtnfunc()
});

$(".pregloginbtn").click(function(){
  setTimeout(function(){ downloadmodal($('#modal-custom'), "/csyma/page/csyma/frontformlogin?headless=true&accepts=html")}, 200);
  
  });

let presignupbtnfunc = function()
{
	console.log("open modal-custom");
	// $('#modal-custom').iziModal('open');
	// setTimeout(function(){ $('#modal-custom').iziModal('open');}, 200);
	// $(".regheader").click();
	downloadmodal($('#modal-custom'), "/csyma/page/csyma/frontform?headless=true&accepts=html")
}

let presignupbtnfunc1 = function(accType)
{
	let page;
	switch(accType)
	{
		case "user":
			page = "insidesignup";
			break;
		default:
			page = "insidesignuporg";
	}
	downloadmodal($('#modal-custom'), "/csyma/page/csyma/"+page+"/"+accType+"?headless=true&accepts=html")
}

let downloadmodal = function(modal, url)
{
	//download...
	// setTimeout(function(){ 

	// 	$(modal).html($('#modal-custom').html())
	// 	$('#modal-custom-1').iziModal('open');
	// 	// $('#modal-custom-1').html("$('#modal-custom').html()<br><br><br><br><br><br><br><br><br><br><br><br>asdhkahdjkas")
	// 	$('#modal-custom-1').iziModal('setTop', 100);;

	// }, 200);
	$.get(url).done(function(preinnerdata){
		
		setTimeout(function(){ 
		    modal.iziModal('open');
			// modal.iziModal('setTop', 200);
			// modal.iziModal('setWidth', 900);
			modal.html(preinnerdata)
		}, 200);

	}).fail(function(){
		alertify.error("Failed to load page.");
	});
}



var initmodals = function()
{
	// $("#modal-custom").iziModal({
	//     overlayClose: false,
	//     width: 600,
	//     overlayColor: 'rgba(0, 0, 0, 0.6)',
	//     transitionIn: 'bounceInDown',
	//     transitionOut: 'bounceOutDown',
	//     navigateCaption: true,
	//     navigateArrows: false,
	//     onOpened: function() {
	//         //console.log('onOpened');
	//     },
	//     onClosed: function() {
	//         //console.log('onClosed');  
	//     }
	// });

	// $("#modal-default").iziModal({
 //    // top: 50,
 //    // bottom: 50,
 //    width: '60%',
 //    padding: 20,
 //    restoreDefaultContent: true,
 //    group: 'grupo1',
 //    loop: true,
 //    fullscreen: true,
 //    openFullscreen: true,
 //    onResize: function(modal){
 //        console.log(modal.modalHeight);
 //    }
	// });
	// $('#modal-default').iziModal('open');
}
// $(".sidea").on("click",function(){loadapp($(this).attr("href"))});


//loading applications from applications menu
$(".sidea").click(function(){loadapp($(this).attr("href"))});
$(".sideap").click(function(){loadpage($(this).attr("href"))});


// $(".locallogincancel").click(function(){$(".loginheader").click();});


var createusersubmit = function(accType, reload){
	accType = accType === "organization"?"organization":"user";
	let email = $(".sigupemail").val()
	let pwd = $(".signuppwd").val()
	let pwdc = $(".signuppwdcnf").val()

	try{
		if(email == "")throw new Error("Please enter email");
		if(pwd == "" || pwdc == "")throw new Error("Please enter password");
		if(pwd != pwdc)throw new Error("Password's don't match");

		let pwdlen = 6;
		if(pwd.length < pwdlen ||pwdc.length < pwdlen)
			throw new Error("Password is shorter than "+pwdlen+" characters");
		let tmpdata = "email="+email+"&password="+pwd+"&confirmPassword="+pwdc;
		console.log(tmpdata);
		let tmpurlipcsubmit = "auth/signupinside/"+accType+"/?"+tmpdata;
		console.log(tmpurlipcsubmit)
		$.post(tmpurlipcsubmit).done(function(innerdata){
  			let datapi;
  			console.log(innerdata)
  			try{
  				if(typeof innerdata != "object")
					datapi = JSON.parse(innerdata);
				else datapi = innerdata;
  				if(datapi.err != undefined)
  					{
  						refusesignupsubmission();
  						alertify.error(""+datapi.err)}
  				else{
  					alertify.success(""+datapi.msg)
  					$(".sigupemail").val("")
  					$(".signuppwd").val("")
  					$(".signuppwdcnf").val("")
  					// $(".signupcancel").click();
  					$(".localloginheader").click();
  					if(reload === 1)
  						loadpage("/#!/csyma/page/csyma/users")
  					else
  						if(reload === 2)
  							loadpage("/#!/csyma/page/csyma/organizations")
  					// addtostack(".")
  					// loadlastpage();
  				}
			}catch(error)
			{
				alertify.error("Unknown error. Please try again later")
			}
			  			
		}).fail(function(){
			refusesignupsubmission();
			alertify.error("Failed. Please check your internet connection try again later.");
		});
	}catch(err)
	{

		refusesignupsubmission();
		alertify.error(""+err);
		//$("#input-password").val("");
		//$("#input-passwordc").val("");
		$(".sigupemail").focus();
		//$("#input-passwordcheck").val("");
	}
	//createusercancelbtn
}

var localloginsubmit = function(){
	let email = $(".localloginemail").val()
	let pwd = $(".localloginpwd").val()

	try{
		if(email == "")throw new Error("Please enter email");
		if(pwd == "")throw new Error("Please enter password");

		let pwdlen = 6;
		if(pwd.length < pwdlen)
			throw new Error("Password is shorter than "+pwdlen+" characters");
		let tmpdata = "email="+email+"&password="+pwd;
		console.log(tmpdata);
		let tmpurlipcsubmit = "auth/signininside"+"?"+tmpdata;
		console.log(tmpurlipcsubmit)
		$.post(tmpurlipcsubmit).done(function(innerdata){
  			let datapi;
  			console.log(innerdata)
  			try{
  				if(typeof innerdata != "object")
					datapi = JSON.parse(innerdata);
				else datapi = innerdata;
  				if(datapi.err != undefined)
  					{
  						refusesignupsubmission();
  						alertify.error(""+datapi.err)}
  				else{
  					alertify.success(""+datapi.msg)
  					$(".localloginemail").val("")
  					$(".localloginpwd").val("");
  					if(datapi.redirect)
  						window.top.location.href = datapi.redirect;
  					// addtostack(".")
  					// loadlastpage();
  				}
			}catch(error)
			{
				alertify.error("Unknown error. Please try again later")
			}
			  			
		}).fail(function(){
			refusesignupsubmission();
			alertify.error("Failed. Please check your internet connection try again later.");
		});
	}catch(err)
	{

		refusesignupsubmission();
		alertify.error(""+err);
		//$("#input-password").val("");
		//$("#input-passwordc").val("");
		$(".sigupemail").focus();
		//$("#input-passwordcheck").val("");
	}
	//createusercancelbtn
}

var whichmodal;
var refusesignupsubmission = function()
{
	var fx = "wobble";
	$("#modal-custom").addClass(fx);
	setTimeout(function(){$("#modal-custom").removeClass(fx)},1500);
}



var postchangeusername = function(){
	let fname = $("#input-first-name").val();
	let mname = $("#input-middle-name").val();
	let lname = $("#input-last-name").val();
	let lang = $("#input-locale").val();
	let gender = $("#input-gender").val();

	try{
		if(fname == "" && mname == "" && lname == "" )throw new Error("Atleast one name is required");
		}catch(err)
	{
		alertify.error(""+err);
		$("#input-first-name").focus();
	}
	
	let data = "fname="+fname+"&mname="+mname+"&lname="+lname+"&lang="+lang+"&gender="+gender;
	console.log(data);
	let tmpurlipc = "/auth/profile"+"?"+data;	//rq rooturl
	console.log(tmpurlipc)
	$.post(tmpurlipc).done(function(innerdata){
		let datapi;
		console.log(innerdata)
		try{
			datapi = JSON.parse(innerdata);
			if(datapi.err != undefined)alertify.error(""+datapi.err)
			else alertify.success(""+datapi.msg)
		}catch(error)
		{
			alertify.error("Unknown error. Please try again later")
		}
		  			
	}).fail(function(){
		alertify.error("Failed. Please check your internet connection try again later.");
	});

	
}

var deleteaccount = function()
{
	console.log("deleting account...")
	alertify.prompt("Delete Account","Are you sure you want to delete your account?(Yes/No)", "No",
	  function(evt, value ){
	    //alertify.success('Ok: ' + value);
	    if(value.toLowerCase()  != 'yes' && value.toLowerCase()  != 'y')
	    	alertify.success('Your account stays safe');
		else
	    {
	    	alertify.confirm("Delete Account","Your account is set to be removed. Click Cancel to cancel this operation",
			function(){

				alertify.warning('Deleting account');
				let url = "auth/drop/"
				postrequest(url, false, function(err){})
			},
			function(){

				 alertify.success('Your account stays safe');
			});
	    }
	  },
	  function(){
	    alertify.success('Your account stays safe');
	});
}

var postchangepwd = function(){
	var pwd = $("#input-password").val();
	var pwdc = $("#input-passwordc").val();
	var oldpwd = $("#input-passwordcheck").val();
	var csrf_name = $("#csrf_name").val();
	var csrf_value = $("#csrf_value").val();
	
	try{
		if(pwd == "" || pwdc == "" || oldpwd == "" )throw new Error("Password not entered");
		if(pwd != pwdc)throw new Error("Password's don't match");
		let pwdlen = 6;
		if(pwd.length < pwdlen ||pwdc.length < pwdlen ||oldpwd.length < pwdlen)
			alertify.warning("Warning: Password seems shorter than expected.");
		let tmpdata = "password="+pwd+"&confirmPassword="+pwdc+"&passwordOld="+oldpwd+"&csrf_name="+csrf_name+"&csrf_value="+csrf_value;
		let tmpurlipc = "auth/password/"+pwd+"/"+pwdc+"/"+oldpwd;
		console.log(tmpurlipc)
		postrequest(tmpurlipc, false, function(err){})
	
	}catch(err)
	{
		alertify.error(""+err);
		$("#input-password").val("");
		$("#input-passwordc").val("");
		$("#input-password").focus();
		$("#input-passwordcheck").val("");
	}
}	


$('.tour-btn').click(function(){
		setTimeout(function(){
			$("#modal").iziModal({
				openFullscreen: true,
				iframe: true,
				zindex: 2000,
				closeOnEscape: false,
				iframeHeight: 800, 
				bodyOverflow: true,
				iframeURL: "/csyma/page/csymaconstruction/csymatour?headless=true",
				// headerColor: '#000',
			    title: 'CSYMA Tour',
			    // subtitle: '...',
			    // icon: 'icon-settings_system_daydream',
			    overlayClose: true,
			    fullscreen: true,
			    borderBottom: false,
			    group: 'grupo1',
			    navigateArrows: false,
			    onFullscreen: function(modal){
			        console.log(modal.isFullscreen);
			    }
			});
			$('#modal').iziModal('open');
			$("#modal").iziModal();
		},250)
})


$(".homebtn").click(function(){
	loadapp($(this).attr("href"), true);
})


let handlers  = {};

let createuser = function()
{
	presignupbtnfunc1("user");
}
let createorg = function()
{
	presignupbtnfunc1("organization");
}