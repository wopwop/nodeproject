var express = require("express"),
    app = express.createServer();
    
// default configuration
app.configure(function(){
    app.set("view engine","ejs");
    app.set("view options",{layout:true});
    app.use(express.static(__dirname + '/public'));
    app.set('public', __dirname + '/public');
})

app.get("/",function(req,res){
    res.render("index");
});

app.listen(3000);