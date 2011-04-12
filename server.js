var express = require("express"),
    app = express.createServer(),
    fs = require("fs"),
    io = require('socket.io'),
    attending_file = __dirname + '/attending.json',
    attendings;


// default configuration
app.configure(function(){
    app.set("view engine","ejs");
    app.set("view options",{layout:true});
    app.use(express.static(__dirname + '/public'));
    app.set('public', express.static(__dirname + '/public'));
})

var names = ["aniss","kamel","ishak"];

app.get("/",function(req,res){
    res.render("index", {locals: {"attendings":attendings}});
});

// get json data
var file = fs.readFile(attending_file, function(err, data){
    if (err) throw err;
    attendings = JSON.parse(data);
});

app.listen(3000);


var socket = io.listen(app);

var config = {user: "_niss", password: "", track: ["Algiers","TEDx","Alger", "Algérie", "Algeria", "entrepreneur", "entrepreneurship"]};
var twitter = new (require("twitter-node").TwitterNode)(config);
twitter.addListener("tweet", function(tweet){socket.broadcast(JSON.stringify(tweet));});
twitter.stream();



