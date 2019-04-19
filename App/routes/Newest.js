var express = require('express');
var router = express.Router();
let date = require('date-and-time');
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var newestR_query = "SELECT Posts.postid, Posts.productname, Posts.description, Posts.pickuppoint, Posts.returnpoint, Posts.startdate, Posts.enddate from Posts left outer join Has on Posts.postid = has.postid left outer join Auctions on has.auctionid = Auctions.auctionid WHERE auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL order by Posts.postid desc limit 10";
router.get('/', function(req, res, next) {
  userid = req.session.userid;
  if (userid == undefined) {
    res.redirect('/')
  } else {
    pool.query(newestR_query, (err, data) => {
      res.render( 'Newest', {title: 'Newest' , data: data.rows });
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
   var productR_query = "SELECT * from Posts natural join Has natural join Auctions WHERE (auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL) AND Posts.productname LIKE '%" + product + "%'" + "order by postid desc limit 10";
   console.log(productR_query);
   pool.query(productR_query, (err, data) => {
    res.render( 'Newest', {title: 'Newest' , data: data.rows});
  });
 } else {
  if (auctionid == undefined) {
    var productR_query = "SELECT * from Posts natural join Has natural join Auctions WHERE (auctions.auctionstatus = 'Open' or auctions.auctionstatus IS NULL) order by postid desc limit 10";
    pool.query(productR_query, (err, data) => {
      console.log(productR_query);
      res.render( 'Newest', {title: 'Newest' , data: data.rows});
    });
  } else {

    if (bidAmount == undefined || bidAmount.length == 0) {
      console.log("Errors!");
      req.flash('info', {msg: 'Please input a bid'});
      res.redirect('/Newest')
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
                    res.redirect('/Newest')
                  });
                });
              });
            });
          } else {
            req.flash('info', {msg: 'Please input a HIGHER bid'});
            res.redirect('/Newest')
          }
        }
      }
    }
  });

// var bids_query = 'INSERT INTO bids(bidAmount) VALUES';
// var biddingFor_query = 'INSERT INTO biddingfor(auctionid, bidid) VALUES';
// router.post('/', function(req, res, next) {
//   userid = req.session.userid;
//   console.log("userId:" + userid);

//   var product = req.body.product;

//   // Retrieve Information
//   //For bid
//   var bidAmount = req.body.placeBid;
//   var auctionid = req.body.auctionid;
//   let now = new Date();
//   now = date.format(now, 'YYYY-MM-DD HH:mm:ss');
//   //query for places

//   //query fot bid Insert
//   var select_targetAuction = 'SELECT * FROM Auctions where auctions.auctionId = ' + auctionid;
//   var bidId;
//   if(bidAmount !="" && bidAmount != undefined){
//     var insertBid_query = bids_query + "('" +  bidAmount + "') RETURNING bidid";
//     pool.query(insertBid_query, (err, data) => {
//       bidId = data.rows[0].bidid;
//       var bf_query = biddingFor_query + "('" + auctionid + "','" + bidId + "')";

//       console.log(bf_query);
//       pool.query(bf_query, (err, data) => {
//           //change highest bid
//           pool.query(select_targetAuction,(err,data)=>{
//             var highestBid =  data.rows[0].highestbid;
//             console.log("highestBid:" + highestBid);
//             if (highestBid < bidAmount){
//               var updateQuery = 'UPDATE Auctions SET highestBid = ' + "'" + bidAmount + "'" + 'WHERE auctions.auctionid = ' + auctionid;
//               pool.query(updateQuery,(err,data)=>{

//               });
//             }
//           });
//        //insert into places
//        var placesbid_query = 'INSERT INTO PLACES VALUES' + "('" + userid + "','" + bidId + "','"  + now + "')";
//        console.log(placesbid_query);
//        pool.query(placesbid_query,(err,data)=>{

//        });
//        res.redirect('/Newest')

//      });
//     });

//   }

//   if (product!=undefined) {
//     var productR_query = 'SELECT * FROM posts WHERE posts.productName LIKE ' + "'%"+ product + "%'";
//   }
//   else {
//     var productR_query = 'SELECT * FROM posts'
//   }

//   pool.query(productR_query, (err, data) => {
//     res.render( 'Newest', {title: 'Newest' , data: data.rows });
//   });

// });
module.exports = router;
