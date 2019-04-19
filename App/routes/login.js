var express = require('express');
var router = express.Router();
const { check, validationResult} = require('express-validator/check');


const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

router.get('/', function(req, res, next) {
  userid = req.session.userid;
  if (userid != undefined) {
    res.redirect('/menu')
  } else {
    res.render( 'login', {title: 'Login'});
  }
});


router.post('/', [
  check('username')
  .isLength({min:1})
  .withMessage('Please input an email'),
  check('password')
  .isLength({min:1})
  .withMessage('Please input a password')]
  ,function(req, res, next) {

    var sess = req.session;
    console.log('req.session.userid (B4): ' + req.session.userid);

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log("errors present");
      req.flash('info', errors.array());
      // return res.status(422).jsonp(errors.array());
      res.redirect('/login')
    }
    else {
      var username = req.body.username;
      var password = req.body.password;

      var retrieve_query = 'SELECT userid, password, accountStatus FROM Users WHERE users.username=' + "'"+ username + "'";
      var response = res;

      pool.query(retrieve_query, function(err,result) {

        if (result.rows[0] == undefined) {
          console.log("undefined");
          var message = {msg: 'Invalid Login'};
          req.flash('info', message);
          response.redirect('/login')
        } else {
          if (result.rows[0].accountstatus == 'Close') {
            var message = {msg: 'Invalid Login'};
            req.flash('info', message);
            response.redirect('/login')
          } else if (password === result.rows[0].password) {
            console.log("Successful Login");
            req.session.userid = result.rows[0].userid;
            req.session.user = username;
            console.log('req.session.userid (Aft): ' + req.session.userid);
            if (result.rows[0].userid == '1') {
              response.redirect('/admin')
            }
            else {
              response.redirect('/menu')
            }
          } else {
            console.log("Invalid login")
            var message = {msg: 'Invalid Login'};
            req.flash('info', message);
            response.redirect('/login')
          }
        }
      });
    }
  });
module.exports = router;
