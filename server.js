const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname))
app.use(express.static("./"))

app.get("/", function(req, res){
    res.sendFile(path.resolve("./index.html"));
})

app.listen(8080, function(){
console.log("I am listening on :8080!");
})