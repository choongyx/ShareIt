var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	userid = req.session.userid;
	console.log(userid);
	if (userid == undefined) {
		res.redirect('/')
	} else {
		res.render('index', { title: 'Express' });
	}
});

module.exports = router;
