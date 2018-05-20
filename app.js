var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// on connection
var users = [];
var numUsers = 0;
io.on('connection', function (socket) {
	// when user clicks button 'let me chat'
	socket.on('setUsername', function(data) { // data is username string
		if (users.indexOf(data) <= -1) { // check if user already exists
			numUsers++;
			users.push(data);
			socket.username = data;
			socket.emit('userSet', {username:data});
			io.sockets.emit('onlineUsers', numUsers);
			console.log('new user '+data+' connected');
		} else {
			socket.emit('userExists', 'this username is taken.');
		}
	});

	// when server receives message, immediately broadcast it to all clients
	socket.on('msg', function(data) {
		io.sockets.emit('newmsg', data);
	});

	socket.on('disconnect', function() {
		if (socket.username) {
			numUsers--;
		}
		users.splice(users.indexOf(socket.username),1);
		io.sockets.emit('onlineUsers', numUsers);
	});
});

http.listen(process.env.PORT || 3000, function () {
	console.log('running!');
});

// :) :)