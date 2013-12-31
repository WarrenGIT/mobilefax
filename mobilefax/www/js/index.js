/*
 * Page INITs
 */

// login page is loaded
$('#pg_login').bind('pageinit', function()
{
	// show the form fields to make sure they are not hidden
	$("#ct_login").show();

	// clear the form values
	frm_login_clear(false);

	// clear feedback messages
	frm_all_clear_feedback("frm_login_feedback");

	// when the login button is pressed
	$("#frm_login_submit").click(function() {
		// store the values
		var usr_name = trim($("#frm_login_usrname").val());
		var usr_pass = trim($("#frm_login_password").val());

		// check if username value were provided
		if (!validate_text(usr_name, "required"))
			$("#frm_login_feedback").html("No username provided.").css('color', '#600').show().fadeOut(2500);
		// check if password value were provided
		else if (!validate_text(usr_pass, "required"))
			$("#frm_login_feedback").html("No password provided.").css('color', '#600').show().fadeOut(2500);
		// all correct
		else
		{
			// slide the form up and hide it
			$("#ct_login").hide(function() {
				// display message that we are busy authentcating the details
				$("#frm_login_feedback").html("Authenticating you login details. Please be patient...").css('color', '#000').show();
				// wait 2.5 seconds and authenticate the user
				setTimeout(function(){
					// call soap function that will validate the user
					var return_array = login_soap_call(usr_name, usr_pass);
					if (return_array["result"])
					{
						// check for storage
						if (hasStorage)
						{
							// although a user can view javascript, this will not be visisble once packed to native code
							var md5auth = MD5(usr_name + cnfcode + usr_pass);

							// set the local storage
							// sessionStorage.getItem();
							// localStorage.removeItem();
							sessionStorage.setItem("sess_usr_name", usr_name);
							sessionStorage.setItem("sess_usr_pass", usr_pass);
							sessionStorage.setItem("sess_auth", md5auth);

							// clear the login fields
							frm_login_clear(false);

							// display success message and navigate to home page
							$("#frm_login_feedback").html(return_array["msg_success"]).css('color', '#060').show();
							setTimeout(function(){
								$.mobile.changePage( "home.html", { transition: "slide" } ); // navigate to the home screen
							}, 2000);
						}
						else
						{
							$("#frm_login_feedback").html("Error: Storage not available.").css('color', '#600').show().fadeOut(5000, function() {
								$("#ct_login").show();
							});
						}
					}
					else
					{
						$("#frm_login_feedback").html(return_array["msg_error"]).css('color', '#600').show().fadeOut(5000, function() {
							$("#ct_login").show();
						});
					}
				}, 2500);
			});
		}
	});

	// when the clear button is pressed
	$("#frm_login_clear").click(function() {
		frm_login_clear();
	});
});

// singup page is loaded
$('#pg_signup').bind('pageinit', function()
{
	// show the form fields to make sure they are not hidden
	$("#ct_signup").show();

	// clear the form values
	frm_signup_clear(false);

	// clear feedback messages
	frm_all_clear_feedback("frm_signup_feedback");

	// when the signup button is pressed
	$("#frm_signup_submit").click(function() {
		// store the values
		var usr_name = $("#frm_signup_name").val();
		var usr_email = $("#frm_signup_email").val();
		var usr_confirm = $("#frm_signup_confirm_email").val();
		var usr_contact = $("#frm_signup_contact").val();
		var usr_test_fax = $("input[name=testfax]:checked").val(); // yes || no

		// check if user name were provided
		if (!validate_text(usr_name, "required"))
			$("#frm_signup_feedback").html("No full name provided.").css('color', '#600').show();
		// check if user email were provided
		else if (!validate_text(usr_email, "required"))
			$("#frm_signup_feedback").html("No email address provided.").css('color', '#600').show();
		// check if user emails match were provided
		else if (!validate_text(usr_confirm, "required"))
			$("#frm_signup_feedback").html("No confirm email address provided.").css('color', '#600').show();
		// check if user emails match were provided
		else if (!validate_text(usr_email, "compare", usr_confirm))
			$("#frm_signup_feedback").html("The 2 email addresses does not match.").css('color', '#600').show();
		// check if user contact were provided
		else if (!validate_text(usr_contact, "required"))
			$("#frm_signup_feedback").html("No contact number provided.").css('color', '#600').show();
		// check if user contact were provided
		else if (!validate_text(usr_test_fax, "required"))
			$("#frm_signup_feedback").html("No option was selected for test fax.").css('color', '#600').show();
		// all correct
		else
		{
			// slide the form up and hide it
			$("#ct_signup").hide(function() {
				// display message that we are busy authentcating the details
				$("#frm_signup_feedback").html("Contacting server for registration. Please be patient...").css('color', '#000').show();

				setTimeout(function(){
					// call the signup soap function that will register the user
					var return_array = signup_soap_call(usr_name, usr_email, usr_contact, usr_test_fax);
					if (return_array["result"])
					{
						frm_signup_clear(false);
						$("#frm_signup_feedback").html(return_array["msg_success"]).css('color', '#060').show();
					}
					else
					{
						$("#frm_signup_feedback").html(return_array["msg_error"]).css('color', '#600').show().fadeOut(5000, function() {
							$("#ct_signup").show();
						});
					}
				}, 2500);
			});
		}
	});

	// when the clear button is pressed
	$("#frm_signup_clear").click(function() {
		frm_signup_clear();
	});
});

// support page is loaded
$('#pg_support').bind('pageinit', function()
{
	$("#support_email").html(support_email);
	$("#support_email").attr("href","mailto:"+support_email+"?Subject="+support_subject);
	$("#support_tel").html(support_tel);
});

/*
 * Events
 */

// reload the signup page when the info box is closed
$("#frm_signup_done").click(function() {
	frm_signup_clear(false);
	$("#ct_signup").show();
});

/*
 * Sign Up functions
 */

// function to call signup soap api
function signup_soap_call(usr_name, usr_email, usr_contact, usr_test_fax)
{
	// construct return array
	var arr_return = {	"result" : false,
						"msg_error" : "na",
						"msg_success" : "na"};

	// connect to server and validate the user details via soap
	$.soap({
		url: baseURL,
		method: 'UserSignup',
		appendMethodToURL: false,
		// addional headers
		HTTPHeaders: {
				'Authorization': 'Basic ' + btoa(baseLogin + ':' + basePass)
			},
		// send the data
		noPrefix: true,
		data: {
			hash: baseHASH,
			name: usr_name,
			email: usr_email,
			phone: usr_contact,
			testfax: (usr_test_fax == "yes") ? 1 : 0
		},
		//callback functions
		success: function (soapResponse) {
			/*
			 * if you want to have the response as JSON use soapResponse.toJSON();
			 * or soapResponse.toString() to get XML string
			 * or soapResponse.toXML() to get XML DOM
			 */

			// convert response to JSON
			var json_result = soapResponse.toJSON();

			// alert('XML CONVERSION: ' + JSON.stringify(json_result.Body.UserSignupResponse.Response, null, 4)); // test info

			// ckeck if conversion was successful
			if (json_result)
			{
				// get the final result from the json return string
				final_result = json_result.Body.UserSignupResponse.Response; // .status || .error || .result

				// check if signup was successful
				if (final_result.status == "false")
				{
					// nope
					arr_return["result"] = false;
					arr_return["msg_error"] = "Error: " + final_result.error;
				}
				else
				{
					// all done successfully
					arr_return["result"] = true;
					arr_return["msg_success"] = "Successfully registered. Your new fax number is <strong>" + final_result.result + "</strong>. Your login details will be emailed to your supplied email address. <br /><br /><button data-theme=\"\" id=\"frm_signup_done\" data-icon=\"check\">";
				}
			}
			else
			{
				// problem with json conversion
				arr_return["result"] = false;
				arr_return["msg_error"] = "Error: Could not convert XML response to JSON";
			}

		},
		error: function (soapResponse) {
			arr_return["result"] = false;
			arr_return["msg_error"] = "Error: " + soapResponse.toString();
		},
		// debugging
		enableLogging: false
	});

	// return feedback
	return arr_return;
}

// function to clear the values of the signup text fields
function frm_signup_clear(clear_container)
{
	// set default value for argument
	if(typeof(clear_container) === "undefined")
		clear_container = true;

	// clear the form
	$("#frm_signup_name").val("");
	$("#frm_signup_email").val("");
	$("#frm_signup_confirm_email").val("");
	$("#frm_signup_contact").val("");
	// only clear if needed
	if (clear_container)
		$("#frm_signup_feedback").html("Cleared").css('color', '#060').show().fadeOut(2500);

	// all done
	return true;
}

/*
 * Login Functions
 */

// function to call login soap api
function login_soap_call(usr_name, usr_pass)
{
	// construct return array
	var arr_return = {	"result" : false,
						"msg_error" : "na",
						"msg_success" : "na"};

	// connect to server and validate the user details via soap
	$.soap({
		url: baseURL,
		method: 'GetUserDetails',
		appendMethodToURL: false,
		// addional headers
		HTTPHeaders: {
				'Authorization': 'Basic ' + btoa(baseLogin + ':' + basePass)
			},
		// send the data
		noPrefix: true,
		data: {
			hash: baseHASH,
			name: usr_name,
			email: usr_email,
			phone: usr_contact,
			testfax: (usr_test_fax == "yes") ? 1 : 0
		},
		//callback functions
		success: function (soapResponse) {
			/*
			 * if you want to have the response as JSON use soapResponse.toJSON();
			 * or soapResponse.toString() to get XML string
			 * or soapResponse.toXML() to get XML DOM
			 */

			// convert response to JSON
			var json_result = soapResponse.toJSON();

			// alert('XML CONVERSION: ' + JSON.stringify(json_result.Body.UserSignupResponse.Response, null, 4)); // test info

			// ckeck if conversion was successful
			if (json_result)
			{
				// get the final result from the json return string
				final_result = json_result.Body.UserSignupResponse.Response; // .status || .error || .result

				// check if signup was successful
				if (final_result.status == "false")
				{
					// nope
					arr_return["result"] = false;
					arr_return["msg_error"] = "Error: " + final_result.error;
				}
				else
				{
					// all done successfully
					arr_return["result"] = true;
					arr_return["msg_success"] = "Successfully registered. Your new fax number is <strong>" + final_result.result + "</strong>. Your login details will be emailed to your supplied email address. <br /><br /><button data-theme=\"\" id=\"frm_signup_done\" data-icon=\"check\">";
				}
			}
			else
			{
				// problem with json conversion
				arr_return["result"] = false;
				arr_return["msg_error"] = "Error: Could not convert XML response to JSON";
			}

		},
		error: function (soapResponse) {
			arr_return["result"] = false;
			arr_return["msg_error"] = "Error: " + soapResponse.toString();
		},
		// debugging
		enableLogging: false
	});

	// return feedback
	return arr_return;
}

// function to clear the values of the login text fields
function frm_login_clear(clear_container)
{
	// set default value for argument
	if(typeof(clear_container) === "undefined")
		clear_container = true;

	// clear the form
	$("#frm_login_usrname").val("");
	$("#frm_login_password").val("");
	// only clear if needed
	if (clear_container)
		$("#frm_login_feedback").html("Cleared").css('color', '#060').show().fadeOut(2500);

	// all done
	return true;
}