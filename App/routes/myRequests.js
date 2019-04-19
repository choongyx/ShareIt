var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


var requestR_query = 'SELECT * FROM requests'

router.get('/', function(req, res, next) {
  userid = req.session.userid;

  if (userid == undefined) {
    res.redirect('/')
  } else {

    var requestR_query = "SELECT * FROM requests R, makes M WHERE R.requestid = M.requestid  and userid = '" + userid + "'";

    pool.query(requestR_query, (err, data) => {
      res.render( 'myRequests', {title: 'Request Management' , data: data.rows });
    });
  }
});


/* SQL Query */
var sql_query = 'INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES';


router.post('/', function(req, res, next) {
	// Retrieve Information
  var name = req.body.name;
  var description = req.body.description;
  var startdate = req.body.startdate;
  var enddate = req.body.enddate;
  var contactnumber = req.body.contactnumber;
  var deleteId = req.body.idDelete;
  userid = req.session.userid;
	// Construct Specific SQL Query
	// Construct Specific SQL Query
  if (deleteId != undefined){
    var deleteRelation_query = 'DELETE FROM makes WHERE requestid =' + deleteId + 'and userid =' + userid;

    pool.query(deleteRelation_query, (err, data) => {
      var delete_query = 'DELETE FROM requests WHERE requestid =' + deleteId;
      pool.query(delete_query, (err, data) => {
        res.redirect('/myRequests')
      });
    });
  }
  else {
    var insert_query = sql_query + "('" + name + "','" + description + "','" + startdate + "','" + enddate + "','" + contactnumber + "') RETURNING requestid";
    pool.query(insert_query, (err, data) => {


      var makes_Insert = "INSERT INTO makes VALUES ('" + userid + "', '" + data.rows[0].requestid + "')";
      pool.query(makes_Insert,(err,data) => {
        console.log(makes_Insert);
      });

      console.log(insert_query);
      res.redirect('/myRequests')
    });
  }

});
module.exports = router;
