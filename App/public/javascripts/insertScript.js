const { check, validationResult} = require('express-validator/check');


function check(event) {
	// Get Values
	var username  = document.getElementById('username' ).value;
	var password   = document.getElementById('password'   ).value;
	var address = document.getElementById('address').value;
	
	// Simple Check
	if(username.length < 1) {
		alert("Invalid matric number");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(password.length < 1) {
		alert("Invalid name");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(address.length < 1) {
		alert("Invalid faculty code");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}