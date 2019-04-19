CREATE TABLE Tags (
  tagid   SERIAL,
  tagName VARCHAR(30) UNIQUE,
  link VARCHAR(30),
  PRIMARY KEY (tagid)
);

CREATE TABLE Bids (
  bidid SERIAL,
  bidAmount REAL,
  PRIMARY KEY (bidid)
  );

CREATE TYPE auctionENUM as ENUM('Open','Close');
CREATE TABLE Auctions (
    auctionId SERIAL,
    startingBid DECIMAL,
    highestBid DECIMAL,
    auctionStatus auctionENUM,
    endBidDate TIMESTAMP,
    PRIMARY KEY (auctionId)
);

CREATE TYPE statusENUM as ENUM('Accepted','Pending', 'Rejected', 'Withdrawn');

CREATE TABLE Categories (
  categoryid SERIAL,
  categoryName VARCHAR(30) UNIQUE,
  description VARCHAR(100),
  link VARCHAR(30),
  PRIMARY KEY (categoryid)
);

CREATE TABLE Posts (
  postid SERIAL,
  productName VARCHAR(30),
  categoryid INTEGER,
  description VARCHAR(30),
  pickUpPoint VARCHAR(30),
  returnPoint VARCHAR(30),
  startDate   DATE,
  endDate     DATE,
  PRIMARY KEY (postId),
  FOREIGN KEY (categoryid) REFERENCES Categories
);

CREATE TABLE Requests (
  requestid SERIAL,
  productName VARCHAR(30),
  description VARCHAR(30),
  startDate   DATE,
  endDate     DATE,
  contactNumber VARCHAR(30),
  requestStatus statusENUM,
  PRIMARY KEY (requestid)
);

CREATE TYPE ratingENUM as ENUM('Positive', 'Neutral', 'Negative');

CREATE TABLE Reviews (
  reviewid SERIAL,
  content VARCHAR(300),
  rating ratingENUM,
  PRIMARY KEY (reviewid)
);

CREATE TYPE userENUM as ENUM('Open','Close');

CREATE TABLE Users (
  userid SERIAL,
  --assume username is email--
  username VARCHAR(40) UNIQUE,
  password VARCHAR(20),
  address VARCHAR(100),
  accountStatus userENUM DEFAULT 'Open',
  PRIMARY KEY (userid)
);

-----------------------
CREATE TABLE EnablesLoan (
    loanId SERIAL,
    nameItem VARCHAR(30),
    loanStartDate DATE,
    loanEndDate DATE,
    price REAL,
    auctionId SERIAL UNIQUE,
    postId SERIAL,
    PRIMARY KEY (loanId),
    FOREIGN KEY (auctionId) references AUCTIONS,
    FOREIGN key (postId) references POSTS
    -- on delete cascade
);

CREATE TABLE Places (
  userid SERIAL,
  bidid SERIAL,
  bidDate DATE,
  PRIMARY KEY (userid, bidid),
  FOREIGN KEY (userid) REFERENCES Users,
  FOREIGN KEY (bidid) REFERENCES Bids
);

CREATE TABLE BiddingFor (
  auctionid SERIAL,
  bidid SERIAL,
  PRIMARY KEY (auctionid, bidid),
  FOREIGN KEY (auctionid) REFERENCES Auctions,
  FOREIGN KEY (bidid) REFERENCES Bids
);

CREATE TABLE Belongs (
  postid SERIAL,
  categoryid SERIAL,
  primary key (postid, categoryid),
  foreign key (categoryid) references Categories,
  foreign key (postid) references Posts
);

CREATE TABLE Tagged (
  tagid SERIAL,
  postid SERIAL,
  primary key (tagid, postid),
  foreign key (tagid) references Tags,
  foreign key (postid) references Posts
);

CREATE TABLE Has (
    postId SERIAL,
    auctionId SERIAL,
    PRIMARY KEY (postId, auctionId),
    FOREIGN KEY (postId) references POSTS,
    FOREIGN KEY (auctionId) references AUCTIONS
);

CREATE TABLE Publishes (
  postid SERIAL,
  userid SERIAL,
  PRIMARY KEY (postid),
  FOREIGN KEY (postid) REFERENCES Posts,
  FOREIGN KEY (userid) REFERENCES Users
);

CREATE TABLE Makes (
  userid SERIAL,
  requestid SERIAL,
  PRIMARY KEY (userid, requestid),
  FOREIGN KEY (userid) REFERENCES Users,
  FOREIGN KEY (requestid) REFERENCES Requests
);

CREATE TABLE Creates (
  revieweeid SERIAL,
  reviewid SERIAL,
  reviewerid SERIAL,
  PRIMARY KEY (revieweeid, reviewid, reviewerid),
  FOREIGN KEY (revieweeid) REFERENCES Users(userid),
  FOREIGN KEY (reviewid) REFERENCES Reviews,
  FOREIGN KEY (reviewerid) REFERENCES Users(userid)
);

CREATE TABLE ReceivesNotifications (
  userid SERIAL,
  notificationid SERIAL,
  title VARCHAR(50),
  content VARCHAR(300),
  PRIMARY KEY (userid, notificationid),
  FOREIGN KEY (userid) REFERENCES Users
);

CREATE TABLE Secures (
    loanId SERIAL,
    userId SERIAL,
    PRIMARY KEY (loanId,userId),
    FOREIGN KEY (loanId) references ENABLESLOAN,
    FOREIGN KEY (userId) references USERS
);

--Trigger 1
CREATE OR REPLACE FUNCTION checkHighest()
RETURNS TRIGGER AS
$$
DECLARE
maximal DECIMAL;
belongAuction REAL;
BEGIN

SELECT highestbid INTO maximal
FROM Auctions
WHERE NEW.auctionid = Auctions.auctionid;
RAISE NOTICE 'Bidding amount is lower than the current highest bid(%)', maximal;
SELECT bidamount INTO belongAuction
FROM Bids
WHERE Bids.bidid = NEW.bidid;
RAISE NOTICE 'Bidding amount is lower than the current highest bid(%)', belongAuction;
IF (belongAuction > maximal) OR (maximal is NULL)
THEN
RETURN NEW;
ELSE
DELETE FROM Bids where bidid = NEW.bidid;
RAISE NOTICE 'Bidding amount is lower than the current highest bid(%)', maximal;
RAISE NOTICE 'Bidding amount is lower than the current highest bid(%)', belongAuction;
RETURN NULL;
END IF ;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER insertBid
BEFORE INSERT OR UPDATE
ON BiddingFor
FOR EACH ROW
EXECUTE PROCEDURE checkHighest();

--Trigger 2
-- CREATE OR REPLACE FUNCTION checkDuplicate()
-- RETURNS TRIGGER AS
-- $$
-- DECLARE auctionSelected INTEGER;
-- bidSelected INTEGER;
-- BEGIN
-- select Auctions.auctionid INTO auctionSelected
-- from places natural join Bids natural join biddingfor natural join Auctions
-- where places.userid = NEW.userid;
-- select Bids.bidid INTO bidSelected
-- from places natural join Bids natural join biddingfor natural join Auctions
-- where places.userid = NEW.userid;
-- if (auctionSelected is not null) THEN
-- DELETE FROM places where places.userid = NEW.userid;
-- DELETE FROM biddingfor where biddingfor.bidid = bidSelected;
-- DELETE FROM bids where bids.bidid = bidSelected;
-- RETURN NEW;
-- else
-- RETURN NEW;
-- END IF;
-- END;
-- $$
-- LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION checkDuplicate()
RETURNS TRIGGER AS
$$
DECLARE auctionSelected INTEGER;
anotherBid INTEGER;
BEGIN
select Auctions.auctionid INTO auctionSelected
from places natural join Bids natural join biddingfor natural join Auctions
where places.bidid = NEW.bidid;
select Places.bidid INTO anotherBid
from places natural join Bids natural join biddingfor natural join Auctions
where Auctions.auctionid = auctionSelected and places.bidid <> NEW.bidid and Places.userid = NEW.userid;
if (anotherBid is not null) THEN
DELETE FROM places where places.bidid = anotherBid;
DELETE FROM biddingfor where biddingfor.bidid = anotherBid;
DELETE FROM bids where bids.bidid = anotherBid;
RETURN NEW;
else
RETURN NEW;
END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER placesBid
AFTER INSERT OR UPDATE
ON Places
FOR EACH ROW
EXECUTE PROCEDURE checkDuplicate();

--Trigger 3
CREATE OR REPLACE FUNCTION def_password()
RETURNS TRIGGER AS
$$
DECLARE oldPassword VARCHAR;
        oldAddress VARCHAR;
        oldAccountStatus userENUM;
BEGIN
    SELECT Users.password INTO oldPassword
    FROM Users
    WHERE Users.userId = NEW.userid;
    SELECT Users.address INTO oldAddress
    FROM Users
    WHERE Users.userId = NEW.userid;
    SELECT Users.accountStatus INTO oldAccountStatus
    FROM Users
    WHERE Users.userId = NEW.userid;
    IF (NEW.password = oldPassword) AND (NEW.address = oldAddress) AND (NEW.accountStatus = oldAccountStatus) THEN
      RAISE NOTICE 'New Password same as';
      RAISE NOTICE 'Old Password';
      RETURN NULL;
    ELSE
      RETURN NEW;
    END IF;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER changePassword
BEFORE UPDATE
ON Users
FOR EACH ROW
EXECUTE PROCEDURE def_password();

--init for Users
INSERT INTO Users(username, password, address)
VALUES ('admin@hotmail.com', 'password', 'Ang Mo Kio');
INSERT INTO Users(username, password, address)
VALUES ('user@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('louisa@hotmail.com', 'password', 'Ang Mo Kio');
INSERT INTO Users(username, password, address)
VALUES ('yongxin@hotmail.com', 'password', 'Tampines');
INSERT INTO Users(username, password, address)
VALUES ('donna@hotmail.com', 'password', 'Bishan');
INSERT INTO Users(username, password, address)
VALUES ('kaining@hotmail.com', 'password', 'Yishun');
INSERT INTO Users(username, password, address)
VALUES ('user1@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user2@hotmail.com', 'password', 'Choa Chu Kang');
INSERT INTO Users(username, password, address)
VALUES ('user3@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user4@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user5@hotmail.com', 'password', 'Ang Mo Kio');
INSERT INTO Users(username, password, address)
VALUES ('user6@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user7@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user8@hotmail.com', 'password', 'Choa Chu Kang');
INSERT INTO Users(username, password, address)
VALUES ('user9@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user10@hotmail.com', 'password', 'Bishan');
INSERT INTO Users(username, password, address)
VALUES ('user11@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user12@hotmail.com', 'password', 'Ang Mo Kio');
INSERT INTO Users(username, password, address)
VALUES ('user13@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user14@hotmail.com', 'password', 'Clementi');
INSERT INTO Users(username, password, address)
VALUES ('user15@hotmail.com', 'password', 'Woodlands');

--init for Categories
INSERT INTO Categories(categoryName, description, Link)
VALUES ('Mobile & Electronics', 'E.g. Tablets, Laptops, Phones', '/MobileandElectronics');
INSERT INTO Categories(categoryName, description, Link)
VALUES ('Women''s Fashion', 'E.g. Coats & Jackets, Shoes, Bags', '/WomensFashion');
INSERT INTO Categories(categoryName, description, Link)
VALUES ('Sports & Outdoors', 'E.g. Yoga Mats, Camping Tools', '/SportsandOutdoors');
INSERT INTO Categories(categoryName, description, Link)
VALUES ('Home & Garden', 'E.g. Home Decor, Party Supplies', '/HomeandGarden');

--init for Tags
INSERT INTO Tags(tagName, link)
VALUES ('Newest', '/newest');
INSERT INTO Tags(tagName, link)
VALUES ('Near You', '/nearyou');
INSERT INTO Tags(tagName, link)
VALUES ('Popular', '/popular');

--init for Posts and Auctions
INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('iPhone 7', 1 , 'Brand New, 64GB', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-01', '2019-05-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (1, 1);
INSERT INTO publishes VALUES (1, 3);
INSERT INTO belongs VALUES (1, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Canon Powershot D7 Mark ii', 1 , 'Slightly used', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-10', '2019-08-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (2, 2);
INSERT INTO publishes VALUES (2, 3);
INSERT INTO belongs VALUES (2, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Formal Blazer', 2 , 'Size S', 'Ang Mo Kio', 'Ang Mo Kio', '2019-02-01', '2019-11-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (3, 3);
INSERT INTO publishes VALUES (3, 3);
INSERT INTO belongs VALUES (3, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Badminton Racket', 3 , 'Brand new', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-11', '2019-07-08');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (40, 'Open', '2019-04-23');
INSERT INTO has VALUES (4, 4);
INSERT INTO publishes VALUES (4, 3);
INSERT INTO belongs VALUES (4, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Helium Pump', 4 , '', 'Ang Mo Kio', 'Ang Mo Kio', '2019-03-21', '2019-08-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (5, 5);
INSERT INTO publishes VALUES (5, 3);
INSERT INTO belongs VALUES (5, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Samsung S10+', 1 , 'Brand New in box', 'Tampines', 'Tampines', '2019-04-01', '2019-05-01');
INSERT INTO publishes VALUES (6, 4);
INSERT INTO belongs VALUES (6, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('DSLR Flash', 1 , 'Suitable for event photography', 'Tampines', 'Tampines','2019-04-10', '2019-08-01');
INSERT INTO publishes VALUES (7, 4);
INSERT INTO belongs VALUES (7, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Laboratory Coat', 2 , 'Size M', 'Tampines', 'Tampines', '2019-02-01', '2019-11-21');
INSERT INTO publishes VALUES (8, 4);
INSERT INTO belongs VALUES (8, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Tennis Racket', 3 , 'Used', 'Tampines', 'Tampines', '2019-04-11', '2019-07-08');
INSERT INTO publishes VALUES (9, 4);
INSERT INTO belongs VALUES (9, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Steamboat Pot', 4 , 'Portable', 'Tampines', 'Tampines', '2019-03-21', '2019-08-21');
INSERT INTO publishes VALUES (10, 4);
INSERT INTO belongs VALUES (10, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('iPhone XS Max', 1 , 'Brand New, 128GB', 'Bishan', 'Bishan','2019-04-01', '2019-05-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (11,6);
INSERT INTO publishes VALUES (11, 5);
INSERT INTO belongs VALUES (11, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Canon Vixia Mini', 1 , 'Slightly used', 'Bishan', 'Bishan','2019-04-10', '2019-08-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (12, 7);
INSERT INTO publishes VALUES (12, 5);
INSERT INTO belongs VALUES (12, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Winter Jacket', 2 , 'Size S, very warm', 'Bishan', 'Bishan', '2019-02-01', '2019-11-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (13, 8);
INSERT INTO publishes VALUES (13, 5);
INSERT INTO belongs VALUES (13, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Basketball', 3 , 'Used', 'Bishan', 'Bishan', '2019-04-11', '2019-07-08');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (14, 9);
INSERT INTO publishes VALUES (14, 5);
INSERT INTO belongs VALUES (14, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Helium Balloon', 4 , '', 'Bishan', 'Bishan', '2019-03-21', '2019-08-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (15, 10);
INSERT INTO publishes VALUES (15, 5);
INSERT INTO belongs VALUES (15, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('HP Photo Sprocket', 1 , 'Photo Printer', 'Yishun', 'Yishun', '2019-04-01', '2019-05-01');
INSERT INTO publishes VALUES (16, 6);
INSERT INTO belongs VALUES (16, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('DSLR Flash', 1 , 'Uses AAA batteries', 'Yishun', 'Yishun', '2019-04-10', '2019-08-01');
INSERT INTO publishes VALUES (17, 6);
INSERT INTO belongs VALUES (17, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Halloween Costume', 2 , 'Size XS', 'Yishun', 'Yishun','2019-02-01', '2019-11-21');
INSERT INTO publishes VALUES (18, 6);
INSERT INTO belongs VALUES (18, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Tennis Racket', 3 , 'New' ,'Yishun', 'Yishun', '2019-04-11', '2019-07-08');
INSERT INTO publishes VALUES (19, 6);
INSERT INTO belongs VALUES (19, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Watering Hose', 4 , 'Used' ,'Yishun', 'Yishun','2019-03-21', '2019-08-21');
INSERT INTO publishes VALUES (20, 6);
INSERT INTO belongs VALUES (20, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('iPhone XR Red', 1 , 'Brand New in box', 'Clementi', 'Clementi', '2019-04-01', '2019-05-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (21, 11);
INSERT INTO publishes VALUES (21, 7);
INSERT INTO belongs VALUES (21, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Panasonic Vacuum Cleaner', 1 , '250W', 'Clementi', 'Clementi','2019-04-10', '2019-08-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (22, 12);
INSERT INTO publishes VALUES (22, 7);
INSERT INTO belongs VALUES (22, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Prom Dress', 2 , 'Size S', 'Clementi', 'Clementi','2019-02-01', '2019-11-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (23, 13);
INSERT INTO publishes VALUES (23, 7);
INSERT INTO belongs VALUES (23, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Swimming Flippers', 3 , 'Size EU40', 'Clementi', 'Clementi','2019-04-11', '2019-07-08');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (40, 'Open', '2019-04-23');
INSERT INTO has VALUES (24, 14);
INSERT INTO publishes VALUES (24, 7);
INSERT INTO belongs VALUES (24, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Mood Light', 4 , '', 'Clementi', 'Clementi', '2019-03-21', '2019-08-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (25, 15);
INSERT INTO publishes VALUES (25, 7);
INSERT INTO belongs VALUES (25, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Samsung Note 9', 1 , 'Brand New in box', 'Choa Chu Kang', 'Choa Chu Kang', '2019-04-01', '2019-05-01');
INSERT INTO publishes VALUES (26, 8);
INSERT INTO belongs VALUES (26, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Fisheye Lens', 1 , 'Suitable for event photography', 'Choa Chu Kang', 'Choa Chu Kang', '2019-04-10', '2019-08-01');
INSERT INTO publishes VALUES (27, 8);
INSERT INTO belongs VALUES (27, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Track Pants', 2 , 'Size M', 'Choa Chu Kang', 'Choa Chu Kang', '2019-02-01', '2019-11-21');
INSERT INTO publishes VALUES (28, 8);
INSERT INTO belongs VALUES (28, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Wii Sports', 3 , 'Used', 'Choa Chu Kang', 'Choa Chu Kang','2019-04-11', '2019-07-08');
INSERT INTO publishes VALUES (29, 8);
INSERT INTO belongs VALUES (29, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Portable BBQ Stove', 4 , 'Portable', 'Choa Chu Kang', 'Choa Chu Kang', '2019-03-21', '2019-08-21');
INSERT INTO publishes VALUES (30, 8);
INSERT INTO belongs VALUES (30, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('iPhone XS Gold', 1 , 'Brand New, 128GB', 'Clementi', 'Clementi', '2019-04-01', '2019-05-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (31,16);
INSERT INTO publishes VALUES (31, 9);
INSERT INTO belongs VALUES (31, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Nintendo Switch', 1 , 'Slightly used', 'Clementi', 'Clementi', '2019-04-10', '2019-08-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (32, 17);
INSERT INTO publishes VALUES (32, 9);
INSERT INTO belongs VALUES (32, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Bomber Jacket', 2 , 'Size S, very warm', 'Clementi', 'Clementi', '2019-02-01', '2019-11-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (33, 18);
INSERT INTO publishes VALUES (33, 9);
INSERT INTO belongs VALUES (33, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Soccer Ball', 3 , 'Used', 'Clementi', 'Clementi', '2019-04-11', '2019-07-08');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (34, 19);
INSERT INTO publishes VALUES (34, 9);
INSERT INTO belongs VALUES (34, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Tsum Tsum Soft Toy', 4 , '', 'Clementi', 'Clementi',  '2019-03-21', '2019-08-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (35, 20);
INSERT INTO publishes VALUES (35, 9);
INSERT INTO belongs VALUES (35, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('LG Colour Printer', 1 , 'Photo Printer', 'Clementi', 'Clementi', '2019-04-01', '2019-05-01');
INSERT INTO publishes VALUES (36, 10);
INSERT INTO belongs VALUES (36, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('4GB Thumbdrive', 1 , '', 'Clementi', 'Clementi', '2019-04-10', '2019-08-01');
INSERT INTO publishes VALUES (37, 10);
INSERT INTO belongs VALUES (37, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Cosplay Costume', 2 , 'Size XS', 'Clementi', 'Clementi', '2019-02-01', '2019-11-21');
INSERT INTO publishes VALUES (38, 10);
INSERT INTO belongs VALUES (38, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Tennis Racket', 3 , 'New' ,'Clementi', 'Clementi', '2019-04-11', '2019-07-08');
INSERT INTO publishes VALUES (39, 10);
INSERT INTO belongs VALUES (39, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Watering Hose', 4 , 'Used' ,'Clementi', 'Clementi', '2019-03-21', '2019-08-21');
INSERT INTO publishes VALUES (40, 10);
INSERT INTO belongs VALUES (40, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Samsung S10+', 1 , 'Brand New in box', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-01', '2019-05-01');
INSERT INTO publishes VALUES (41, 11);
INSERT INTO belongs VALUES (41, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('DSLR Bag', 1 , 'Suitable for event photography', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-10', '2019-08-01');
INSERT INTO publishes VALUES (42, 11);
INSERT INTO belongs VALUES (42, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Long Coat', 2 , 'Size M', 'Ang Mo Kio', 'Ang Mo Kio', '2019-02-01', '2019-11-21');
INSERT INTO publishes VALUES (43, 11);
INSERT INTO belongs VALUES (43, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Tennis Balls', 3 , 'Used', 'Ang Mo Kio', 'Ang Mo Kio', '2019-04-11', '2019-07-08');
INSERT INTO publishes VALUES (44, 11);
INSERT INTO belongs VALUES (44, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Mookata Pot', 4 , 'Portable', 'Ang Mo Kio', 'Ang Mo Kio', '2019-03-21', '2019-08-21');
INSERT INTO publishes VALUES (45, 11);
INSERT INTO belongs VALUES (45, 4);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('iPhone XS Max', 1 , 'Brand New, 128GB', 'Clementi', 'Clementi','2019-04-01', '2019-05-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (46,21);
INSERT INTO publishes VALUES (46, 12);
INSERT INTO belongs VALUES (46, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Canon Vixia Mini', 1 , 'Slightly used', 'Clementi', 'Clementi', '2019-04-10', '2019-08-01');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (10, 'Open', '2019-04-23');
INSERT INTO has VALUES (47, 22);
INSERT INTO publishes VALUES (47, 12);
INSERT INTO belongs VALUES (47, 1);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Winter Jacket', 2 , 'Size S, very warm', 'Clementi', 'Clementi', '2019-02-01', '2019-11-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (48, 23);
INSERT INTO publishes VALUES (48, 12);
INSERT INTO belongs VALUES (48, 2);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Basketball', 3 , 'Used', 'Clementi', 'Clementi',  '2019-04-11', '2019-07-08');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (49, 24);
INSERT INTO publishes VALUES (49, 12);
INSERT INTO belongs VALUES (49, 3);

INSERT INTO posts(productName, categoryid, description, pickUpPoint, returnPoint, startDate, endDate)
VALUES ('Helium Balloon', 4 , '', 'Clementi', 'Clementi',  '2019-03-21', '2019-08-21');
INSERT INTO auctions(startingBid, auctionstatus, endbiddate) VALUES (0, 'Open', '2019-04-23');
INSERT INTO has VALUES (50, 25);
INSERT INTO publishes VALUES (50, 12);
INSERT INTO belongs VALUES (50, 4);

--init for Requests
INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Hammer', 'hammer', '2019-06-11', '2019-06-21', '92367233' );
INSERT INTO makes VALUES (3,1);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Baking Pan', 'baking pan', '2019-04-21', '2019-04-22', '92367233' );
INSERT INTO makes VALUES (3,2);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Pruning Shears', 'pruning shears', '2019-09-08', '2019-09-29', '92367233' );
INSERT INTO makes VALUES (3,3);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Suitcase', 'suitcase', '2019-04-17', '2019-05-17', '92367233');
INSERT INTO makes VALUES (5,4);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Kitchen Scale', 'kitchen scale', '2019-05-23', '2019-08-21', '90086526');
INSERT INTO makes VALUES (7,5);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Air Mattress','air mattress', '2019-09-13', '2019-09-20', '92367233');
INSERT INTO makes VALUES (3,6);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Drilling Machine', 'drilling machine', '2019-03-21', '2019-08-21', '92736142' );
INSERT INTO makes VALUES (18,7);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Board Games', 'board games', '2019-03-21', '2019-08-21', '96343846');
INSERT INTO makes VALUES (17,8);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Blender', 'blender', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (19,9);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Camping Chair', 'camping chair', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (10,10);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Cutlery', 'cutlery', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (9,11);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Baking Pan', 'baking pan', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (7,12);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Baking Pan Large', 'baking pan large kind ', '2019-03-21', '2019-08-21','92367233' );
INSERT INTO makes VALUES (6,13);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Baking Pan Small', 'small baking pan', '2019-03-21', '2019-08-21', '91628738');
INSERT INTO makes VALUES (15,14);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Kettle', 'kettle', '2019-03-21', '2019-05-04', '92367233');
INSERT INTO makes VALUES (12,15);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Skipping Rope', 'skipping rope', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (10,16);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Water Gun', 'water gun', '2019-03-21', '2019-08-21', '92367233');
INSERT INTO makes VALUES (5,17);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Badminton', 'badminton', '2019-04-25', '2019-06-11', '92367233');
INSERT INTO makes VALUES (2,18);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Kite', 'kite', '2019-07-03', '2019-07-08', '92367233');
INSERT INTO makes VALUES (7,19);

INSERT INTO requests(productName, description, startdate, enddate, contactnumber) VALUES ('Go-Kart', 'go-kart', '2019-10-21', '2019-11-21', '92367233');
INSERT INTO makes VALUES (5,20);

INSERT INTO Reviews(content, rating) VALUES ('pleasant borrower!', 'Positive');
INSERT INTO Creates VALUES (5,1,2);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Neutral');
INSERT INTO Creates VALUES (6,2,8);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (11,3,9);

INSERT INTO Reviews(content, rating) VALUES ('item was in bad condition', 'Negative');
INSERT INTO Creates VALUES (11,4,6);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (9,5,7);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (10,6,11);

INSERT INTO Reviews(content, rating) VALUES ('average', 'Neutral');
INSERT INTO Creates VALUES (15,7,12);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (14,8,4);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Negative');
INSERT INTO Creates VALUES (9,9,3);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (10,10,2);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Positive');
INSERT INTO Creates VALUES (1,11,2);

INSERT INTO Reviews(content, rating) VALUES ('bad condition!', 'Negative');
INSERT INTO Creates VALUES (1,12,2);

INSERT INTO Reviews(content, rating) VALUES ('lender was late', 'Negative');
INSERT INTO Creates VALUES (1,13,2);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Neutral');
INSERT INTO Creates VALUES (1,14,2);

INSERT INTO Reviews(content, rating) VALUES ('good', 'Positive');
INSERT INTO Creates VALUES (1,15,2);

INSERT INTO Reviews(content, rating) VALUES ('good', 'Positive');
INSERT INTO Creates VALUES (1,16,2);

INSERT INTO Reviews(content, rating) VALUES ('awesome!', 'Neutral');
INSERT INTO Creates VALUES (5,17,12);

INSERT INTO Reviews(content, rating) VALUES ('convenient', 'Neutral');
INSERT INTO Creates VALUES (4,18,3);

INSERT INTO Reviews(content, rating) VALUES ('nice to work with!', 'Neutral');
INSERT INTO Creates VALUES (1,19,2);

INSERT INTO Reviews(content, rating) VALUES ('good item!', 'Positive');
INSERT INTO Creates VALUES (1,20,15);
