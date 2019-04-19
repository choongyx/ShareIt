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

    var postR_query = "SELECT * FROM enablesLoan NATURAL JOIN secures where userid = '" + userid + "'";
    pool.query(postR_query, (err, data) => {
      console.log(postR_query);
      res.render( 'myLoans', {title: 'My Loans' , data: data.rows});
    });
  }
});
module.exports = router;