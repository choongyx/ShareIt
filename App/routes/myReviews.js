var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var reviewR_query = 'SELECT * FROM reviews'

router.get('/', function(req, res, next) {
  userid = req.session.userid;

  if (userid == undefined) {
    res.redirect('/')
  } else {

    var reviewR_query = "SELECT * FROM reviews R, creates C inner join users U on C.reviewerid = U.userid WHERE R.reviewid = C.reviewid  and reviewerid = '" + userid + "'";

    pool.query(reviewR_query, (err, data) => {
      res.render( 'myReviews', {title: 'Review Management' , data: data.rows });
    });
  }
});


/* SQL Query */
var sql_query = 'INSERT INTO reviews(content, rating) VALUES';


router.post('/', function(req, res, next) {
  console.log('entering');
  // Retrieve Information
  var content = req.body.content;
  var rating = req.body.rating;
  var deleteId = req.body.reviewIdToDelete;

  // Construct Specific SQL Query
  if (deleteId != undefined){
     var delete_query = 'DELETE FROM creates WHERE reviewid =' + "'"+ deleteId  + "' AND reviewerid = " + userid + ";"  + 'DELETE FROM reviews WHERE reviewid =' + "'"+ deleteId  + "';";
    console.log(delete_query);
    pool.query(delete_query, (err, data) => {
      res.redirect('/myReviews')
    });
  } else {
    console.log('inserting');
    var insert_query = sql_query + " ('" + content + "', " + rating + ")";
    pool.query(insert_query, (err, data) => {
      console.log(insert_query);
      res.redirect('/myReviews')
    });
  }

});
module.exports = router;
