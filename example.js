// use sticky example
var sticky = require("sticky-session");

sticky(function(){
	return createApp();
}).listen(3000, function() {
	console.log("listen on localhost:3000");
});

function createApp() {
	var app = require("express")();
	var http = require("http").Server(app);

	app.get("/", function(req, res){
		res.sendFile(__dirname + "/example.html");
	});

	var io = require('socket.io')(http);
	var txt = require("./index.js");
	io.adapter( txt({ name: "session.txt" }) );

	io.on("connection", function(socket){
		console.log('a user connected');

		socket.on("chat", function(data){
			socket.broadcast.emit("chat", data);
		});

		socket.on("disconnect", function(){
			console.log("disconnect");
		});
	});
	return http;
}