// If you want to earn complete credit for your work, you must use all five of these packages in your assignment.
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express(); // initializes Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoIgn";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }); //

app.get("/", function(req, res) {
  // route for getting all scraped articles
  db.Article.find({})
    .then(function(dbArticle) {
      res.render("index", { dbArticle });
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/scrape", function(req, res) {
  // route for scraping bbc news articles
  axios.get("https://www.ign.com/articles?tags=news").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".listElmnt").each(function(i, element) {
      var result = {};
      result.src = $(element)
        .children()
        .children()
        .children("img")
        .attr("src");
      result.alt = $(element)
        .children()
        .children()
        .children("img")
        .attr("alt");
      result.link = $(element)
        .children()
        .children("a")
        .attr("href");
      result.summary = $(element)
        .children()
        .children("p")
        .text();

      result.saved = false;

      db.Article.updateMany(
        { title: result.alt },
        {
          $set: {
            image: { src: result.src, alt: result.alt },
            title: result.alt,
            original: result.src,
            summary: result.summary,
            link: result.link,
            saved: false
          }
        },
        { upsert: true }
      )
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape completed");
  });
});

app.post("/articles/:id", function(req, res) {
  // route for saving/deleting specified article
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { saved: req.body.saved } }
  )
    .then(function(dbArticle) {
      // console.log("dbArticle:" + dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.get("/articles", function(req, res) {
  // route for getting all saved articles
  db.Article.find({})
    .then(function(dbArticle) {
      res.render("articles", { dbArticle });
      // res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  // route for getting one article by id and its notes
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      console.log("hi " + dbArticle.notes);
      res.json(dbArticle.notes);
      // res.render("articles", { dbNote })
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/notes/:id", function(req, res) {
  // route for saving/updating note on specified article
  db.Note.create(req.body)
    .then(function(dbArticle) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: dbArticle._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/notes/:id", function(req, res) {
  // route for deleting notes
  db.Note.deleteOne({ _id: req.params.id })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

app.get("/notes", function(req, res) {
  // route for getting all saved articles
  db.Note.find({})
    .then(function(dbNote) {
      res.render("notes", { dbNote });
      // res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
