var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

	userid = req.session.userid;

	if (userid != undefined) {
		req.flash('info', {msg: 'loggedIn'});
	}

	res.render('about', { title: 'About' });
});

module.exports = router;
