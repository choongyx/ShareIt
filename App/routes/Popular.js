var express = require('express');
var router = express.Router();
let date = require('date-and-time');
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


/* Popular not done yet cus need bids table*/

var popularR_query = "with numbidders as (SELECT postid, count(*) as num from posts natural join has natural join biddingfor group by postid) SELECT * from Posts natural join Has natural join Auctions natural join numbidders WHERE auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL order by num desc limit 10 ";
router.get('/', function(req, res, next) {
  userid = req.session.userid;
  if (userid == undefined) {
    res.redirect('/')
  } else {
    pool.query(popularR_query, (err, data) => {
      res.render( 'Popular', {title: 'Popular ' , data: data.rows });
    });
  }
});


/* SQL Query */
router.post('/', function(req, res, next) {

  var bidAmount = req.body.placeBid;
  var product = req.body.product;
  var auctionid = req.body.auctionid;

  console.log("auctionId: " + auctionid);
  console.log("bidAmount: " + bidAmount);
  console.log("product: " + product);

  if (product != undefined && product.length != 0) {
   var productR_query = "with numbidders as (SELECT postid, count(*) as num from posts natural join has natural join biddingfor group by postid) SELECT * from Posts natural join Has natural join Auctions natural join numbidders WHERE (auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL) AND Posts.productname LIKE '%" + product + "%' order by num desc limit 10";
   console.log(productR_query);
   pool.query(productR_query, (err, data) => {
    res.render( 'Popular', {title: 'Popular' , data: data.rows});
  });
 } else {
  if (auctionid == undefined) {

    var productR_query = "with numbidders as (SELECT postid, count(*) as num from posts natural join has natural join biddingfor group by postid) SELECT * from Posts natural join Has natural join Auctions natural join numbidders WHERE (auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL) order by num desc limit 10";
    pool.query(productR_query, (err, data) => {
      console.log(productR_query);
      res.render( 'Popular', {title: 'Popular' , data: data.rows});
    });
  } else {

    if (bidAmount == undefined || bidAmount.length == 0) {
      console.log("Errors!");
      req.flash('info', {msg: 'Please input a bid'});
      res.redirect('/Popular')
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
                    res.redirect('/Popular')
                  });
                });
              });
            });
          } else {
            req.flash('info', {msg: 'Please input a HIGHER bid'});
            res.redirect('/Popular')
          }
        }
      }
    }
  });
module.exports = router;
