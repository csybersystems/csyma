$("a1").click(function(){loadapp($(this))})

var createuser = function(){
	addtostack(".");	
	$("body").ufModal({
        sourceUrl: "/apps/?app=csyber&action=loadpage&page=createuser",
        msgTarget: $("#alerts-page")
    });
}


var moduser = function(whichuser){
	addtostack(".");	
	console.log("which user"+whichuser)
	console.log("apps/?app=csyber&action=loadpage&page=addusertoapp&user="+whichuser)
	$("body").ufModal({
        sourceUrl: "/apps/?app=csyber&action=loadpage&page=addusertoapp&user="+whichuser,
        msgTarget: $("#alerts-page")
    });

    //attachUserForm();
}

var moduser2 = function(whichuser){
	//addtostack(".");	
	console.log("which user"+whichuser)
	$("body").ufModal({
        sourceUrl: "/apps/?app=csyber&action=loadpage&page=addusertoapp&user="+whichuser,
        msgTarget: $("#alerts-page")
    });

    //attachUserForm();
}

var createusersubmit = function(){
	let email = $(".createusername").val()
	let pwd = $(".createuserpwd").val()
	let pwdc = $(".createusercnfpwd").val()

	try{
		if(pwd != pwdc)throw new Error("Password's don't match");
		if(pwd == "" || pwdc == "")throw new Error("Please enter password");
		if(email == "")throw new Error("Please enter email");
		let pwdlen = 6;
		if(pwd.length < pwdlen ||pwdc.length < pwdlen)
			throw new Error("Password is shorter than "+pwdlen+" characters");
		let tmpdata = "email="+email+"&password="+pwd+"&confirmPassword="+pwdc;
		console.log(tmpdata);
		let tmpurlipcsubmit = "auth/signupinside"+"?"+tmpdata;
		console.log(tmpurlipcsubmit)
		$.post(tmpurlipcsubmit).done(function(innerdata){
  			let datapi;
  			console.log(innerdata)
  			try{
  				if(typeof innerdata != "object")
					datapi = JSON.parse(innerdata);
				else datapi = innerdata;
  				if(datapi.err != undefined)alertify.error(""+datapi.err)
  				else{
  					alertify.success(""+datapi.msg)
  					$(".createusercancelbtn").click();
  					addtostack(".")
  					loadlastpage();
  				}
			}catch(error)
			{
				alertify.error("Unknown error. Please try again later")
			}
			  			
		}).fail(function(){
			alertify.error("Failed. Please check your internet connection try again later.");
		});
	}catch(err)
	{
		alertify.error(""+err);
		//$("#input-password").val("");
		//$("#input-passwordc").val("");
		$(".createusername").focus();
		//$("#input-passwordcheck").val("");
	}
	//createusercancelbtn
}

var manageapp = function()
{
	alertify.success("You can manage applications for individual users by clicking on the user.")
	
}
var managegroups = function(action, user, app, group)
{
	
	let tmpdata = "app=csyber&csyber&action=managegroups&caction="+action+"&user="+user+"&cgroup="+group+"&capp="+app
	let url = "apps/?"+tmpdata
	console.log(url);
	try
	{
		$.get(url).done(function(innerdata){
			let datapi;
			console.log(innerdata)
			try{
				if(typeof innerdata != "object")
				datapi = JSON.parse(innerdata);
			else datapi = innerdata;
				if(datapi.err != undefined)alertify.error(""+datapi.err)
				else{
					alertify.success(""+datapi.msg+" You'll be able to see the changes next time you come back here")
					//$(".closeaddusertoapp").click();
					//moduser2(user);
					//addtostack(".")
					//loadlastpage();
				}
		}catch(error)
		{
			alertify.error("Unknown error. Please try again later")
		}
			  			
		}).fail(function(){
			alertify.error("Failed. Please check your internet connection try again later.");
		});
	}catch(err)
	{
		alertify.error(""+err);
	}
}
