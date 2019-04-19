var express = require('express');
var router = express.Router();
let date = require('date-and-time');
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


// var postR_query = "SELECT DISTINCT users.username, auctions.highestbid, auctions.startingbid, posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid inner join Bids on auctions.highestbid = Bids.bidamount inner join Places on Places.bidid = Bids.bidid inner join Users on Users.userid = Places.userid WHERE auctions.endbiddate = current_date AND auctions.auctionstatus = '" + "Open" + "' order by Posts.postid asc";
// var postR_query = 'SELECT posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid WHERE auctions.endbiddate = current_date order by Posts.postid asc';
var postR_query = "SELECT DISTINCT users.username, auctions.highestbid, auctions.startingbid, posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate FROM posts inner join Has ON posts.postid = Has.postid INNER JOIN Auctions ON Has.auctionid = Auctions.auctionid INNER JOIN Categories ON Categories.categoryid = Posts.categoryid LEFT OUTER JOIN Bids ON auctions.highestbid = Bids.bidamount LEFT OUTER JOIN Places ON Places.bidid = Bids.bidid LEFT OUTER JOIN Users ON Users.userid = Places.userid WHERE auctions.endbiddate = current_date AND auctions.auctionstatus = '" + "Open" + "' ORDER BY Posts.postid ASC";

router.get('/', function(req, res, next) {

  userid = req.session.userid;
  
  if (userid == undefined || userid != 1) {
    res.redirect('/')
  } else {

    //console.log(postR_query);

    pool.query(postR_query, (err, data) => {
      res.render( 'admin', {title: 'Auction Management ' , data: data.rows });
    });
  }
});

router.post('/', function(req, res, next) {
  // Retrieve Information
  var auctionId = req.body.auctionId;
  console.log("post");

  // Construct Specific SQL Query
  if (auctionId != undefined) {

    var update_query = 'UPDATE Auctions set ';
    var update = update_query + 'auctionStatus = ' + "'Close'" + ' WHERE auctionid =' + "'" + auctionId + "'";

    pool.query(update, (err, data) => {
      console.log(update);

      var bids_count = "SELECT * from bids NATURAL JOIN biddingFor natural join auctions where auctionid = " + auctionId;
      pool.query(bids_count, (err, data) => {
        bids_count = data.rows.length;
        console.log("BIDS:" + bids_count);

        if (bids_count > 0) {

          var posts_Select = "SELECT * from Posts natural join Has natural join Bids where auctionid ='" + auctionId + "'";
          pool.query(posts_Select, (err, data) => {

            console.log(posts_Select);

            var nameItem = data.rows[0].productname;
            var loanStartDate = data.rows[0].startdate.toUTCString();
            var loanEndDate = data.rows[0].enddate.toUTCString();
            var price = data.rows[0].bidamount;
            var postId = data.rows[0].postid;
            var biddingId = data.rows[0].bidid;

            console.log(loanStartDate);

            var loans_Creates = "INSERT INTO enablesloan(nameItem, loanStartDate, loanEndDate, price, auctionid, postid) VALUES ('" + nameItem + "','" + loanStartDate + "','" + loanEndDate + "','" + price + "','" + auctionId + "'," + postId + ") RETURNING loanid";
            pool.query(loans_Creates, (err, data) => {
              console.log(loans_Creates);

              var loanId = data.rows[0].loanid;

              var user_Select = "SELECT userid from biddingFor NATURAL JOIN bids NATURAL JOIN places where auctionid = '" + auctionId + "' ORDER BY bidamount DESC LIMIT 1";
              pool.query(user_Select, (err, data) => {
                console.log(user_Select);

                var useridWin = data.rows[0].userid;

                var secures_Insert = "INSERT INTO secures VALUES ('" + loanId + "','" + useridWin + "')";
                pool.query(secures_Insert, (err, data) => {
                  console.log(secures_Insert);

              // var bidder = "SELECT userid from Places inner join Bids on Bids.bidid = '" + biddingId + "' where bidamount = '" + price +"'"  ;
              // pool.query(bidder, (err, data) => {
              //   console.log(bidder);

              //   var bidderid = data.rows[0].userid;

              var notification_Creates = "INSERT INTO receivesnotifications(userid, title, content) VALUES (" + "'" + userid + "', " + "'Loan Secured!'," + "'*Item: " + nameItem + "* *Start Date: " +  loanStartDate  + "* *End Date: " + loanEndDate  + "* *Price: $" + price  + "*')";
              pool.query(notification_Creates, (err, data) => {
                console.log(notification_Creates);

                res.redirect('/admin')
              });
            });
              });
            });  
          });

        } else {
          res.redirect('/admin')
        }
      });
    });
    // });
  }
});
module.exports = router;
