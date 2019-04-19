var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})

router.get('/', function(req, res, next) {

	userid = req.session.userid;
	if (userid == undefined) {
		res.redirect('/')
	} else {

		view_query = 'SELECT * from users where userid ='+"'"+ userid +"'";

		pool.query(view_query, function(err,data) {
			res.render('profile', { title: 'Profile', data:data});
			console.log(view_query);
			password = data.rows[0].password;
			address = data.rows[0].address;
		});
	}
});


router.post('/', function(req, res, next) {
	// Retrieve Information
	var newAddress = req.body.newAddress;
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var deletePassword = req.body.password;

	// Construct Specific SQL Query
	if (deletePassword != undefined){

		if (deletePassword != password) {
			var message = {msg: 'Incorrect Password'};
			console.log(message);
			req.flash('info2', message);
			res.redirect('/profile')
		} else {
			var close_account = "UPDATE users SET accountstatus = 'Close' WHERE userid =" + "'"+ userid + "'";

			pool.query(close_account, (err, data) => {
				console.log(close_account);
				req.session.destroy(function(err) {
					res.redirect('/login')
				});
			});
		}
	}
	else {

		var update_query = 'UPDATE users set ';

		if (newPassword != undefined){

			if (newPassword.length == 0) {
				var message = {msg: 'Invalid New Password'};
				req.flash('info', message);
				res.redirect('/profile')
			} else {

				if (oldPassword != password) {
					var message = {msg: 'Incorrect Old Password'};
					req.flash('info', message);
					res.redirect('/profile')
				} else {

					var update = update_query + 'password = ' + "'" + newPassword + "'" + ' WHERE userid =' + "'" + userid + "'";

					pool.query(update, (err, data) => {
						console.log(update);
						console.log(data.rowCount);
						if (data.rowCount != 0) {
							var message = {msg: 'Password successfully updated'};
						}
						else {
							var message = {msg: 'You must use a different password'};
						}
						req.flash('info', message);
						res.redirect('/profile')
					});
				}
			}

		} else if (newAddress != undefined) {
			console.log('change address');
			console.log(newAddress);
			var update = update_query + 'address = ' + "'" + newAddress + "'" + ' WHERE userid =' + "'" + userid + "'";

			pool.query(update, (err, data) => {
				console.log('newAddress')
				console.log(update);
				var message = {msg: 'Address successfully updated'};
				req.flash('info1', message);
				res.redirect('/profile')
			});
		}
	}
});


module.exports = router;
