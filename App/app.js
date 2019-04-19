var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var validator = require('express-validator');
var flash = require('express-flash');
var session = require('express-session');

/* --- V7: Using dotenv     ---*/
require('dotenv').load();

/* --- All Visitors --- */
var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');
var createUserRouter = require('./routes/register')
var loginRouter = require('./routes/login');
var profileRouter = require('./routes/profile');
var logoutRouter = require('./routes/logout');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

/* --- Admin: Function --- */
var createCategoryRouter = require('./routes/createACategory')
var createTagRouter = require('./routes/createATag')
var categoriesRouter = require('./routes/categories')
var tagsRouter = require('./routes/tags')


/* --- V2: Adding Web Pages --- */

var createPostRouter = require('./routes/createAPost');
var allPostsRouter = require('./routes/allPosts');
var allRequestsRouter = require('./routes/allRequests')
var myRequestsRouter = require('./routes/myRequests');
var myReviewsRouter = require('./routes/myReviews');
var myLoansRouter = require('./routes/myLoans');
var myBidsRouter = require('./routes/myBids');
var reviewsOfMeRouter = require('./routes/reviewsOfMe');
var myPostsRouter = require('./routes/myPosts');
var notificationsRouter = require('./routes/notifications');
var categoryListingRouter = require('./routes/categoryListing');
var tagListingRouter = require('./routes/tagListing');
var MobileandElectronicsRouter = require('./routes/MobileandElectronics')
var WomensFashionRouter = require('./routes/WomensFashion')
var SportsandOutdoorsRouter = require('./routes/SportsandOutdoors')
var HomeandGardenRouter = require('./routes/HomeandGarden')
var NewestRouter = require('./routes/Newest')
var PopularRouter = require('./routes/Popular')
var NearyouRouter = require('./routes/Nearyou')
var freeLoansRouter = require('./routes/freeLoans')
/* ---------------------------- */

/* --- V3: Basic Template   --- */

var searchRouter = require('./routes/search');
/* ---------------------------- */



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

/* -- session -- */
// app.use(session({ cookie: { maxAge: 60000 },
//                   secret: 'woot',
//                   resave: false,
//                   saveUninitialized: false}));

app.use(session({
  key: 'userid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: { expires: 600000 }
}));

// // This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// // This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');
//     }
//     next();
// });


// // middleware function to check for logged-in users
// var sessionChecker = (req, res, next) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.redirect('/dashboard');
//     } else {
//         next();
//     }
// };

app.use('/', loginRouter);
app.use('/users', usersRouter);
app.use('/menu', indexRouter);

/* --- V2: Adding Web Pages --- */
app.use('/about', aboutRouter);
app.use('/admin', adminRouter);
app.use('/createACategory', createCategoryRouter)
app.use('/createATag', createTagRouter)
app.use('/login', loginRouter);
app.use('/createAPost', createPostRouter)
app.use('/allPosts', allPostsRouter)
app.use('/allRequests', allRequestsRouter)
app.use('/myRequests', myRequestsRouter)
app.use('/myLoans', myLoansRouter)
app.use('/myReviews', myReviewsRouter)
app.use('/myBids', myBidsRouter)
app.use('/reviewsOfMe', reviewsOfMeRouter)
app.use('/notifications', notificationsRouter)
app.use('/myPosts', myPostsRouter)
app.use('/categories', categoriesRouter)
app.use('/categoryListing', categoryListingRouter)
app.use('/tagListing', tagListingRouter)
app.use('/MobileandElectronics', MobileandElectronicsRouter)
app.use('/WomensFashion', WomensFashionRouter)
app.use('/SportsandOutdoors', SportsandOutdoorsRouter)
app.use('/HomeandGarden', HomeandGardenRouter)
app.use('/Newest', NewestRouter)
app.use('/Popular', PopularRouter)
app.use('/Nearyou', NearyouRouter)
app.use('/freeLoans', freeLoansRouter)
app.use('/tags', tagsRouter)
app.use('/profile', profileRouter)
app.use('/logout', logoutRouter)


/* ---------------------------- */



/* --- V5: Adding Forms     --- */
app.use('/search',searchRouter);
/* ---------------------------- */

/* --- V6: Modify Database  --- */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/createACategory', createCategoryRouter)

app.use('/createAPost', createPostRouter)
app.use('/myRequests', myRequestsRouter)
app.use('/myPosts', myPostsRouter)
app.use('/createATag', createTagRouter)
app.use('/categoryListing', categoryListingRouter)
app.use('/tagListing', tagListingRouter)
app.use('/MobileandElectronics', MobileandElectronicsRouter)
app.use('/WomensFashion', WomensFashionRouter)
app.use('/SportsandOutdoors', SportsandOutdoorsRouter)
app.use('/HomeandGarden', HomeandGardenRouter)
app.use('/Newest', NewestRouter)
app.use('/Popular', PopularRouter)
app.use('/Nearyou', NearyouRouter)
/* ---------------------------- */

/* --- Create User --- */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/register', createUserRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
