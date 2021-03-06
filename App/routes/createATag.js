var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var tagR_query = 'SELECT * FROM tags'

router.get('/', function(req, res, next) {
  if (userid == undefined || userid != 1) {
    res.redirect('/')
  } else {
    pool.query(tagR_query, (err, data) => {
      res.render( 'createATag', {title: 'Tag Management' , data: data.rows });
    });
  }
});


/* SQL Query */
var sql_query = 'INSERT INTO tags(tagName) VALUES';


router.post('/', function(req, res, next) {
	// Retrieve Information
  var name = req.body.name;
  var deleteName = req.body.nameDelete;

	// Construct Specific SQL Query
	if (deleteName != undefined){
    var delete_query = 'DELETE FROM tags WHERE tagname =' + "'"+ deleteName + "'";
    console.log(delete_query);
    pool.query(delete_query, (err, data) => {
      res.redirect('/createATag')
    });
  }
  else {
    var insert_query = sql_query + "('" + name + "')";
    pool.query(insert_query, (err, data) => {
      res.redirect('/createATag')
    });
  }

});
module.exports = router;
