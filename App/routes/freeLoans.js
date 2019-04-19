var express = require('express');
var router = express.Router();
let date = require('date-and-time');
const { check, validationResult} = require('express-validator/check');

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var postR_query = 'SELECT posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate, auctions.auctionStatus FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid where not exists (select 1 from Has where postid = posts.postid) order by Posts.postid asc';

router.get('/', function(req, res, next) {

  userid = req.session.userid;
  if (userid == undefined) {
    res.redirect('/')
  } else {

    pool.query(postR_query, (err, data) => {
      console.log(postR_query);
      res.render( 'freeLoans', {title: 'Free Loans ' , data: data.rows});
    });
  }
});


router.post('/', function(req, res, next) {

  var postid = req.body.postid;

  var select_post = "SELECT * FROM posts where postid = " + postid;
  pool.query(select_post, (err, data) => {
    console.log(select_post);

    var nameItem = data.rows[0].productname;
    var loanStartDate = data.rows[0].startdate.toUTCString();
    var loanEndDate = data.rows[0].enddate.toUTCString();

    console.log(loanStartDate);

    let now = new Date();
    now = date.format(now, 'YYYY-MM-DD HH:mm:ss');

    var auction_create = "INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES ('0', 'Close', '" + now + "') RETURNING auctionid"; 
    pool.query(auction_create,(err,data) => {
      console.log(auction_create);
      auctionId = data.rows[0].auctionid;

      var has_Insert = 'INSERT INTO has VALUES' + "('" + postid + "','" + auctionId + "')";
      pool.query(has_Insert,(err,data) => {
        console.log(has_Insert);

        var loans_Creates = "INSERT INTO enablesloan(nameItem, loanStartDate, loanEndDate, price, auctionid, postid) VALUES ('" + nameItem + "','" + loanStartDate + "','" + loanEndDate + "','0','" + auctionId + "'," + postid + ") RETURNING loanid";
        pool.query(loans_Creates, (err, data) => {
          console.log(loans_Creates);

          var loanId = data.rows[0].loanid;

          var secures_Insert = "INSERT INTO secures VALUES ('" + loanId + "','" + userid + "')";
          pool.query(secures_Insert, (err, data) => {
            console.log(secures_Insert);

            var notification_Creates = "INSERT INTO receivesnotifications(userid, title, content) VALUES (" + "'" + userid + "', " + "'Loan Secured!'," + "'*Item: " + nameItem + "* *Start Date: " +  loanStartDate  + "* *End Date: " + loanEndDate  + "*')";
            pool.query(notification_Creates, (err, data) => {
              console.log(notification_Creates);

              req.flash('info', {msg: 'Loan Successfully Created!'});
              res.redirect('/freeLoans')
            });
          });
        });
      });
    });
  });
});
module.exports = router;
