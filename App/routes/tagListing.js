var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})


var categorylistingR_query = 'SELECT * from Tags';
router.get('/', function(req, res, next) {
	userid = req.session.userid;
	if (userid == undefined) {
		res.redirect('/')
	} else {

		pool.query(categorylistingR_query, (err, data) => {
			res.render( 'tagListing', {title: 'Tags' , data: data.rows });
		});
	}
});


module.exports = router;