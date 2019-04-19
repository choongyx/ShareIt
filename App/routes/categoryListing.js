var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})


var categorylistingR_query = 'SELECT * from Categories';
router.get('/', function(req, res, next) {

	userid = req.session.userid;
	if (userid == undefined) {
		res.redirect('/')
	} else {

		pool.query(categorylistingR_query, (err, data) => {

			res.render( 'categoryListing', {title: 'Categories' , data: data.rows });
		});
	}
});


module.exports = router;