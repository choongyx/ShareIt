var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var categorylistingR_query = 'SELECT * from Categories';
router.get('/', function(req, res, next) {

  userid = req.session.userid;
  
  if (userid == undefined) {
    res.redirect('/')
  } else {

    pool.query(categorylistingR_query, (err, data) => {
      res.render( 'createAPost', {title: 'Posts ' , data: data.rows });
    });
  }
});


/* SQL Query */
var sql_query = 'INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate) VALUES';


router.post('/', function(req, res, next) {

	// Retrieve Information
  var name = req.body.name;
  var description = req.body.description;
  var categoryid = req.body.categoryid;
  var pickuppoint = req.body.pickuppoint;
  var returnpoint = req.body.returnpoint;
  var startdate = req.body.startdate;
  var enddate = req.body.enddate;
  // for auction create
  var startBid = req.body.startBid;
  var endBidding = req.body.biddingEnd;

  // Construct Specific SQL Query

  if (name.length != 0 && description.length != 0 && startdate.length != 0 && enddate.length != 0) {
    var auctionId; 
    console.log("1" + startBid);
    var insert_query = sql_query + "('" + name + "','"  + categoryid + "','" + description + "','" + pickuppoint + "','" + returnpoint + "','" + startdate + "','" + enddate + "') RETURNING postid";


    if (startBid != "" && endBidding!="" ){

      var auction_create = 'INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES' + "('" + startBid + "','" + 'Open' + "','" +  endBidding + "') RETURNING auctionid"; 
      pool.query(auction_create,(err,data) => {
        //global variable 
        auctionId = data.rows[0].auctionid;
      });

    }
    pool.query(insert_query, (err, data) => {

      var publishes_Insert = "INSERT INTO publishes VALUES ('" + data.rows[0].postid + "', '" + userid + "')";
      pool.query(publishes_Insert,(err,data) => {
        console.log(publishes_Insert);
      });

      var belongs_Insert = "INSERT INTO belongs VALUES ('" + data.rows[0].postid + "', '" + categoryid + "')";
      pool.query(belongs_Insert,(err,data) => {
        console.log(belongs_Insert);
      });

      if (auctionId!= undefined){
        var has_Insert = 'INSERT INTO has VALUES' + "('" + data.rows[0].postid + "','" + auctionId + "')";
        pool.query(has_Insert,(err,data) => {

        });
      }
      var message = {msg: 'Post Successfully Created!'};
      req.flash('info', message);
      res.redirect('/createAPost')
    });
  } else {
    var message = {msg: 'Invalid Inputs'};
    req.flash('info', message);
    res.redirect('/createAPost')
  }

});
module.exports = router;
