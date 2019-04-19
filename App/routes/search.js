var express = require('express');
var router = express.Router();
const { check, validationResult} = require('express-validator/check');

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

router.get('/', function(req, res, next) {

  userid = req.session.userid;
  
  if (userid == undefined) {
    res.redirect('/')
  } else {

    var userR_query = "SELECT * FROM users WHERE userid <>  1 AND users.accountStatus = 'Open' AND userid <> " + userid;

    pool.query(userR_query, (err, data) => {
      res.render( 'search', {title: 'Search for Users' , data: data.rows });
    });
  }

});

var sql_query = 'INSERT INTO reviews(content, rating) VALUES';

router.post('/', function(req, res, next) {

  userid = req.session.userid;

  var username = req.body.username;

  var reviewContent = req.body.reviewContent;
  console.log("content: "+ reviewContent);
  var reviewRating = req.body.reviewRating;
  console.log("reviewRating: "+ reviewRating);
  var revieweeid = req.body.revieweeId;
  console.log("id: "+ revieweeid);


  var reviewid;
  if (reviewContent != undefined && reviewRating != undefined) {
    if (reviewContent != "" && reviewRating != "") {
      console.log("Here");
      var create_review = sql_query + "('" + reviewContent + "','" + reviewRating + "') RETURNING reviewid";

      pool.query(create_review,(err,data) => {
        reviewid =  data.rows[0].reviewid;
        console.log("reviewid: "+ reviewid);

        if (reviewid!= undefined);
        console.log("revieweeid: " + revieweeid);
        var create_Creates = 'INSERT INTO Creates VALUES' + "('" + revieweeid + "','" + reviewid + "','" + userid + "')";

        pool.query(create_Creates,(err,data) => {

        });
        res.redirect('/search')
      });
    }
  }

  if (username!=undefined) {
    var userR_query = 'SELECT * FROM Users WHERE users.username LIKE ' + "'%"+ username + "%'" + "AND userid <> 1 AND users.accountStatus = 'Open' AND userid <> " + userid;
  }
  else {
    var userR_query = "SELECT * FROM users WHERE users.accountStatus = 'Open' AND userid <> 1 AND userid <> " + userid;
  }

  pool.query(userR_query, (err, data) => {
    res.render( 'search', {title: 'User List' , data: data.rows });
  });

});
module.exports = router;
