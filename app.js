var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// on connection
users = [];
io.on('connection', function (socket) {
	// when user clicks button 'let me chat'
	socket.on('setUsername', function(data) { // data is username string
		if (users.indexOf(data) === -1) { // check if user already exists
			users.push(socket);
			socket.emit('userSet', {username:data});
			io.sockets.emit('onlineUsers', users.length);
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
		var i = users.indexOf(socket);
		users.splice(i, 1);
		io.sockets.emit('onlineUsers', users.length);
	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

// :) :)