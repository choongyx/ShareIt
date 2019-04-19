var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var categoryR_query = 'SELECT * FROM categories'

router.get('/', function(req, res, next) {

  pool.query(categoryR_query, (err, data) => {
		res.render( 'categories', {title: 'Category List' , data: data.rows });
	});
});


/* SQL Query */
var sql_query = 'INSERT INTO categories(categoryName, description) VALUES';


router.post('/', function(req, res, next) {
	// Retrieve Information
  var name = req.body.name;
  var description = req.body.description;
  var deleteName = req.body.nameDelete;

	// Construct Specific SQL Query
	if (deleteName != undefined){
    var delete_query = 'DELETE FROM categories WHERE categoryname =' + "'"+ deleteName + "'";
    console.log(delete_query);
    pool.query(delete_query, (err, data) => {
      res.redirect('/categories')
    });
  }
  else {
    var insert_query = sql_query + "('" + name + "','" + description + "')";
    pool.query(insert_query, (err, data) => {
      res.redirect('/categories')
    });
  }

});
module.exports = router;
