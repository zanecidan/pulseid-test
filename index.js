var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./route.js");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

var server = app.listen(8080, function () {
    console.log("Server running on locahost:8080");
});