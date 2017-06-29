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
	let tmpurlipc = "account/profile"+"?"+data;
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

var postchangepwd = function(){
	var pwd = $("#input-password").val();
	var pwdc = $("#input-passwordc").val();
	var oldpwd = $("#input-passwordcheck").val();
	var csrf_name = $("#csrf_name").val();
	var csrf_value = $("#csrf_value").val();

	console.log("vaues...."+csrf_value)
	
	try{
		if(pwd != pwdc)throw new Error("Password's don't match");
		if(pwd == "" || pwdc == "" || oldpwd == "" )throw new Error("Password not entered");
		let pwdlen = 6;
		if(pwd.length < pwdlen ||pwdc.length < pwdlen ||oldpwd.length < pwdlen)
			alertify.warning("Warning: Password seems shorter than expected.");
		let tmpdata = "password="+pwd+"&confirmPassword="+pwdc+"&passwordOld="+oldpwd+"&csrf_name="+csrf_name+"&csrf_value="+csrf_value;
		console.log(tmpdata);
		let tmpurlipc = "auth/password"+"?"+tmpdata;
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
	}catch(err)
	{
		alertify.error(""+err);
		$("#input-password").val("");
		$("#input-passwordc").val("");
		$("#input-password").focus();
		$("#input-passwordcheck").val("");
	}
	
	
}	

var deleteaccount = function()
{
	console.log("deleting account...")
	alertify.prompt("Are you sure you want to delete your account?(Yes/No)", "No",
	  function(evt, value ){
	    //alertify.success('Ok: ' + value);
	    if(value.toLowerCase()  != 'yes' && value.toLowerCase()  != 'y')
	    	alertify.success('Your account stays safe');
		else
	    {
	    	alertify.confirm("Your account is set to be removed. Click Cancel to cancel this operation",
			function(){

				alertify.warning('Deleting account');
				$.post("/account/delete").done(function(innerdata){
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