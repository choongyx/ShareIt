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

    var reviewR_query = "SELECT * FROM reviews R, creates C inner join users U on C.reviewerid = U.userid WHERE R.reviewid = C.reviewid  and revieweeid = '" + userid + "'";

    pool.query(reviewR_query, (err, data) => {
      res.render( 'reviewsOfMe', {title: 'Reviews' , data: data.rows });
    });
  }
});

module.exports = router;
