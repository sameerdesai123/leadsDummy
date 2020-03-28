//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");


const app = express();
const template = require("mustache");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'hbs');

//TODO
app.get("/admin-login",function(req,res){
  res.render("admin-login");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
