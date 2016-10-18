var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, database){
	if(err){
		console.log(err);
		process.exit(1);
	}

	db = database;
	console.log("database connection ready");

	var server = app.listen(process.env.PORT || 8080, function(){
		var port = server.address().port;
		console.log("app now running on port ", port);
	});
});


// Routes
function handleError(res, reason, message, code){
	console.log("ERROT: " + reason);
	res.status(code || 500).json({"error": message});
}

app.get("/contacts", function(req, res){
	db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
		if (err){
			handleError(res, err.message, "Failed to get contacts");
		} else {
			res.status(200).json(docs);
		}
	})

});

app.post("/contacts", function(req, res){
	var newContact = req.body;
	newContact.createDate = new Date();

	if (!(req.body.firstName || req.body.lastName)){
		handleError(res, "Invalid user input", "Must provide first or last name.", 400)
	}

	db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
		if (err){
			handleError(res, err.message, "Failed to create new contact.");
		} else {
			res.status(201).json(doc.ops[0]);
		}
	});

});

app.get("/contacts/:id", function(req, res){
	db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id)}, function(err, doc){
		if (err){
			handleError(res, err.message, "failed to get contact");
		} else {
			res.status(200).json(doc)
		}
	});

});

app.put("/contacts/:id", function(req, res){
	var updateDoc = req.body;
	db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc){
		if (err) {
			handleError(res, err.message, "failed to update contact")
		} else {
			res.status(204).end();
		}
	})

});

app.delete("/contacts/:id", function(req, res){
	db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result){
		if (err) {
			handleError(res, err.message, "Failed to delete contact");
		} else {
			res.status(204).end();
		}
	})
});