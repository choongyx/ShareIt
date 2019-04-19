function showAuctionForm(){
	var x = document.getElementById("auctionForm1");
	var y = document.getElementById("auctionForm2");
	if (x.style.display === "none") {
		x.style.display = "block";
		y.style.display = "block";
	} else {
		x.style.display = "none";
		y.style.display = "none";
	}
}

function showAuction(x,y,z,q,a){
	var g = document.getElementById("auctionOverlay");
	var h = document.getElementById("actualOverlay1");
	var i = document.getElementById("actualOverlay2");
	console.log("auctionId:"+ x);
	console.log("auction status:" + a)
	if(g.style.display === "none"){
		if( ( x!="") && (a="Open") ) {
			document.getElementById("showA").innerHTML = "Auction Id: " + x ;
			document.getElementById("showE").innerHTML = "End Bidding Date: " + y ;
			document.getElementById("showH").innerHTML = "Current highest Bid: " + z;
			document.getElementById("showM").innerHTML = "Minimum Bid Required: " + q;
			document.getElementById("inputAuctionId").value = x;
			document.getElementById("inputAuctionSB").value = q;
			document.getElementById("inputAuctionHB").value = z;
			g.style.display = "block";
			h.style.display = "block";
			
		}
		else {
			document.getElementById("free").innerHTML = "Item is Free to Loan";
			document.getElementById("free2").innerHTML = "or Auction has ended!";
			g.style.display = "block";
			i.style.display = "block";
		}
		
	}
}


function createLoan(x, y){
	console.log("Create Loan")
	var g = document.getElementById("loanOverlay");
	var h = document.getElementById("actualOverlay1");
	// var i = document.getElementById("actualOverlay2");
	console.log("postId:"+ x);
	if(g.style.display === "none"){
		if( ( x!="") && (a="Open") ) {
			document.getElementById("showA").innerHTML = "Post Id: " + x ;
			document.getElementById("showB").innerHTML = "Product Name: " + y ;
			document.getElementById("inputPostId").value = x;
			g.style.display = "block";
			h.style.display = "block";
		}
	}
}

function offLoan() {
	document.getElementById("loanOverlay").style.display = "none";
	document.getElementById("actualOverlay1").style.display = "none";
}

function off() {
	document.getElementById("auctionOverlay").style.display = "none";
	document.getElementById("actualOverlay1").style.display = "none";
	document.getElementById("actualOverlay2").style.display = "none";
}


function showCategory(){
	var categoryName = document.getElementById('name' ).value;
	var description = document.getElementById('description').value;
	alert("Category " + categoryName + " has been created!")
}

function showUser(){
	var username = document.getElementById('username' ).value;
	var password = document.getElementById('password').value;
	var address = document.getElementById('address').value;
	alert("User " + username + " has been created!")

}

function alertLoan(){
	var username = document.getElementById('username' ).value;
	var password = document.getElementById('password').value;
	var address = document.getElementById('address').value;
	alert("User " + username + " has been created!")

}

function showTag(){
	var tagName = document.getElementById('tagName' ).value;
	alert("Tag " + tagName + " has been created!")
}

function createdPost(){
	var productName = document.getElementById('name' ).value;
	var description = document.getElementById('description').value;
	alert("Post for " + productName + " has been created!")
}

function createdRequest(){
	var requestName = document.getElementById('name' ).value;
	var description = document.getElementById('description').value;
	alert("Post for " + requestName + " has been created!")
}

function createdReview(){
	var userId = document.getElementById('revieweeId' ).value;
	alert("Review has been created!")
}

function deletedReview(){
	var reviewId = document.getElementById('reviewIdToDelete' ).value;
	alert("Review " + reviewId + " has been deleted!")
}

function changeAddress() {
	var newAddress = document.getElementById('newAddress').value;
	alert("Address has been updated!")
}

function alertPlaceBid() {
	alert("You have placed a Bid!")
}



function showReviewForm(){
	var content = document.getElementById("reviewContent");
	var rating = document.getElementById("reviewRating");
	var user = document.getElementById("revieweeId");
	if (content.style.display === "none") {
		content.style.display = "block";
		rating.style.display = "block";
		user.style.display = "block";
	} else {
		content.style.display = "none";
		rating.style.display = "none";
		user.style.display = "none";

	}
}
