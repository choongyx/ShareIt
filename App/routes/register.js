var express = require('express');
var router = express.Router();
const { check, validationResult} = require('express-validator/check');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})


router.get('/', function(req, res, next) {

	userid = req.session.userid;
	if (userid != undefined) {
		res.redirect('/menu')
	} else {
		res.render('register', {title: 'Register'});
	}
});


/* SQL Query */
var sql_query = 'INSERT INTO users(username, password, address) VALUES';


router.post('/', [
	check('username')
	.isEmail()
	.withMessage('Please input a valid email')
	.isLength({min:1})
	.withMessage('Please input an email'),
	check('password')
	.isLength({min:1})
	.withMessage('Please input a password'),
	check('address')
	.isLength({min:1})
	.withMessage('Please input an address')
	], function(req, res, next) {


		const errors = validationResult(req)
		var errorsArr = errors.array();

		if (!errors.isEmpty()) {
			console.log("Errors!");
			req.flash('info', errors.array());
		// return res.status(422).jsonp(errors.array());
		res.redirect('/register')
	} else {
		// Retrieve Information
		var username = req.body.username;
		var password = req.body.password;
		var confirmPassword = req.body.confirmPassword;
		var address = req.body.address;

		pool.query('SELECT username FROM users WHERE username = ' + "'" + username + "'", (err, data) => {
			if (data.rows[0] != undefined) {
				errorsArr.push({msg: 'Email has already been used'});
				req.flash('info', errorsArr);
				res.redirect('/register')
			} else {

				if (password != confirmPassword) {
					errorsArr.push({msg: 'Password entered does not match'});
					req.flash('info', errorsArr);
					res.redirect('/register')
				} else {

				// Construct Specific SQL Query
				var insert_query = sql_query + "('" + username + "','" + password + "','" + address + "') RETURNING userid";
				pool.query(insert_query, (err, data) => {

					var userid = data.rows[0].userid

					var send_notification = "INSERT INTO receivesnotifications(userid, title, content) VALUES ('" + userid + "','" + "Welcome to ShareIt!', 'Thank for registering with ShareIt! Happy Lending & Loaning!')";
					pool.query(send_notification, (err, data) => {
						console.log(send_notification);
					});
					res.redirect('/login');
				});
			}
		}
	});
	}
});

module.exports = router;
