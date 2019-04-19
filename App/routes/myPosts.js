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

    var postR_query = "SELECT * FROM posts P natural join publishes U inner join Categories on Categories.categoryid = P.categoryid where U.userid = '" + userid + "'"
    pool.query(postR_query, (err, data) => {
      console.log(postR_query);
      res.render( 'myPosts', {title: 'My Posts ' , data: data.rows});
    });
  }
});


/* SQL Query */
var sql_query = 'INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate) VALUES';


router.post('/', function(req, res, next) {
	// Retrieve Information
  var deleteId = req.body.idDelete;
  userid = req.session.userid;
	// Construct Specific SQL Query
	if (deleteId != undefined){
    var deleteRelation_query = "DELETE FROM publishes WHERE postid = '" + deleteId + 'and userid =' + userid;

    pool.query(deleteRelation_query, (err, data) => {
      var delete_query = "DELETE FROM posts WHERE postid = '" + deleteId + '' ;
      console.log(delete_query);
      pool.query(delete_query, (err, data) => {
        res.redirect('/myPosts')
      });
    });
  }
});
module.exports = router;
