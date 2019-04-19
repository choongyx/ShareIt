var express = require('express');
var router = express.Router();
let date = require('date-and-time');
const { check, validationResult} = require('express-validator/check');

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var postR_query = "SELECT posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate, auctions.auctionStatus FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid WHERE auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL order by Posts.postid asc";

router.get('/', function(req, res, next) {

  userid = req.session.userid;
  if (userid == undefined) {
    res.redirect('/')
  } else {

    pool.query(postR_query, (err, data) => {
      console.log(postR_query);
      res.render( 'allPosts', {title: 'All Posts ' , data: data.rows});
    });
  }
});


router.post('/', function(req, res, next) {

  var bidAmount = req.body.placeBid;
  var product = req.body.product;
  var auctionid = req.body.auctionid;

  console.log("auctionId: " + auctionid);
  console.log("bidAmount: " + bidAmount);
  console.log("product: " + product);

  if (product != undefined && product.length != 0) {
   var productR_query = "SELECT posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate, auctions.auctionStatus FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid WHERE (auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL) and Posts.productname LIKE '%" + product + "%'" + " order by Posts.postid asc";
   console.log(productR_query);
    // var productR_query = 'SELECT * FROM posts WHERE posts.productName LIKE ' + "'%"+ product + "%'";
    pool.query(productR_query, (err, data) => {
      res.render( 'allPosts', {title: 'All Posts' , data: data.rows});
    });
  } else {
    if (auctionid == undefined) {
      var productR_query = "SELECT posts.postid, posts.productname, Categories.categoryname, posts.categoryid, posts.description,posts.pickuppoint, posts.returnpoint,posts.startdate,posts.enddate, auctions.auctionid, auctions.startingbid, auctions.highestbid, auctions.endbiddate, auctions.auctionStatus FROM posts left outer join Has on posts.postid = Has.postid left join Auctions on Has.auctionid = Auctions.auctionid inner join Categories on Categories.categoryid = Posts.categoryid WHERE auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL order by Posts.postid asc";
      pool.query(productR_query, (err, data) => {
        res.render( 'allPosts', {title: 'All Posts' , data: data.rows});
      });
    } else {

      if (bidAmount == undefined || bidAmount.length == 0) {
        console.log("Errors!");
        req.flash('info', {msg: 'Please input a bid'});
        res.redirect('/allPosts')
      } else {
        var auctionid = req.body.auctionid;
        var startingbid = req.body.startingBid;
        
        var highestbid = req.body.highestBid;
        console.log("highestBid: " + highestbid);
        if (highestbid == undefined || highestbid.length == 0) {
          highestbid = startingbid;
        }
        let now = new Date();
        now = date.format(now, 'YYYY-MM-DD HH:mm:ss');

        console.log("bidAmount: " + bidAmount);
        console.log("auctionId: " + auctionid);
        console.log("startingBid: " + startingbid);
        console.log("highestBid: " + highestbid);
        console.log("Date: " + now);
        console.log("Userid: " + userid);

        // if (bidAmount >= startingbid && bidAmount > highestbid) {

          if (bidAmount - startingbid >= 0 && bidAmount - highestbid > 0) {

            var insertBid_query = "INSERT INTO bids(bidAmount) VALUES ('" +  bidAmount + "') RETURNING bidid";
            pool.query(insertBid_query, (err, data) => {
              console.log(insertBid_query);

              var bidId = data.rows[0].bidid;

              var bf_query = "INSERT INTO biddingfor(auctionid, bidid) VALUES ('" + auctionid + "', '" + bidId + "')";
              pool.query(bf_query, (err, data) => {
                console.log(bf_query);

                var placesbid_query = 'INSERT INTO PLACES VALUES' + "('" + userid + "','" + bidId + "','"  + now + "')";
                pool.query(placesbid_query,(err,data)=>{
                  console.log(placesbid_query);

                  var updateQuery = 'UPDATE Auctions SET highestBid = ' + "'" + bidAmount + "'" + ' WHERE auctions.auctionid = ' + auctionid;
                  pool.query(updateQuery,(err,data)=>{
                    console.log(updateQuery);
                    res.redirect('/allPosts')
                  });
                });
              });
            });
          } else {
            req.flash('info', {msg: 'Please input a HIGHER bid'});
            res.redirect('/allPosts')
          }
        }
      }
    }
  });
module.exports = router;
