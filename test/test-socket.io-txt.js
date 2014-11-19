var should  = require("should");
var fs 		= require("fs");
var http = require("http").Server;

var io = require("socket.io");
var ioClient = require("socket.io-client");

var async 	= require("async");
var txt = require("../index.js");

var TXT_FILE = "test/session.txt";

describe("broadcast socket", function(){

	var ios = [];
	var clients = [];

	beforeEach(function(done){
		async.waterfall([
			function(next) {
				fs.writeFile(TXT_FILE, "", next);
			},
			function(next) {
				ios.push( createServer({ port: 8888 }) );
				ios.push( createServer({ port: 8889 }) );
				next();
			},
			function(next) {
				clients.push( createClient(ios[0]) );
				clients.push( createClient(ios[1]) );
				next();
			},
			function(next) {
				async.parallel([
					function(_next) {
						clients[0].on("connect", function(){
							clients[0].emit("join", function(){
								_next();
							});
						});
					},
					function(_next) {
						clients[1].on("connect", function(){
							clients[1].emit("join", function(){
								_next();
							});
						});
					},
				], function(err,results){
					next();
				});
				
			},
			function(next) {
				done();
			}
		]);
	});

	afterEach(function(done){
		fs.writeFile(TXT_FILE, "", function(){
			done();
		});
	});

	it("should broadcast from a socket", function(done){
		clients[0].on("broadcast", function(data){
			data.should.equal("hello");
			done();	
		});
		clients[1].emit("socket broadcast", "hello");
	});
});

describe("broadcast namespace", function(){

	var ios = [];
	var clients = [];

	beforeEach(function(done){
		async.waterfall([
			function(next) {
				fs.writeFile(TXT_FILE, "", next);
			},
			function(next) {
				ios.push( createServer({ port: 8878 }) );
				ios.push( createServer({ port: 8879 }) );
				next();
			},
			function(next) {
				clients.push( createClient(ios[0], "/somenamespace") );
				clients.push( createClient(ios[1], "/somenamespace") );
				next();
			},
			function(next) {
				async.parallel([
					function(_next) {
						clients[0].on("connect", function(){
							clients[0].emit("join", function(){
								_next();
							});
						});
					},
					function(_next) {
						clients[1].on("connect", function(){
							clients[1].emit("join", function(){
								_next();
							});
						});
					},
				], function(err,results){
					next();
				});
				
			},
			function(next) {
				done();
			}
		]);
	});

	afterEach(function(done){
		fs.writeFile(TXT_FILE, "", function(){
			done();
		});
	});

	it("should broadcast from a namespace", function(done){
		clients[0].on("broadcast", function(data){
			data.should.equal("hello");
			done();	
		});
		clients[1].emit("namespace broadcast", "hello");
	});


});




function createClient(opt, nsp) {
	var addr = opt.srv.address();
	var url = "ws://" + addr.address + ":" + addr.port + (nsp || "");
	return ioClient(url, {
		forceNew: true
	});
}

function createServer(args) {
	var server = require("http").createServer();
	var io = require("socket.io")(server);
	io.adapter( txt({ name: TXT_FILE }) );

	["/", "/somenamespace"].forEach(function(name){

		io.of(name).on("connection", function(socket){
			socket.on("join", function(callback){
				socket.join("room", callback);
			});
			socket.on("socket broadcast", function(data){
				socket.broadcast.to("room").emit("broadcast", data);
			});
			socket.on("namespace broadcast", function(data){
				io.of("/somenamespace").in("room").emit("broadcast", data);
			});
		});

	});

	server.listen(args.port);
	return { io: io, srv: server };
}