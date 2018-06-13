// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

app.use(express.static("public"));
var databaseUrl = "scraper";
var collections = ["infoz"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get("/", function(req, res) {
  res.send("Hello world");
});

app.get("/all", function(req, res) {
  db.infoz.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

app.get("/title", function(req, res) {
  db.infoz.find().sort({ title: 1 }, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

app.get("/points", function(req, res) {
  db.infoz.find().sort({ points: -1 }, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

app.get("/scrape", function(req, res) {
  request("https://www.trueachievements.com/game/"+"Human-Fall-Flat"+"/achievements", function(error, response, html) {
    var $ = cheerio.load(html);
    $(".itemright").each(function(i, element) {
      var title = $(element).children(".header").children(".mainlink").text();
      var doIt = $(element).children(".subheader").children("span").text();
      var points = $(element).children(".header").children("span").text();
      if (title && doIt) {
        db.infoz.insert({
          title: title,
          doIt: doIt,
          points: points
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
