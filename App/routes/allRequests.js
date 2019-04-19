var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})


var requestR_query = 'SELECT * from requests natural join makes natural join users';

router.get('/', function(req, res, next) {

	userid = req.session.userid;
	if (userid == undefined) {
		res.redirect('/')
	} else {

		pool.query(requestR_query, (err, data) => {
			res.render( 'allRequests', {title: 'Requests' , data: data.rows});
		});
	}
});

module.exports = router;