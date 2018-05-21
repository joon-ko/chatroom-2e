var express = require('express'), app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// on connection
var users = [];
var numUsers = 0;
io.on('connection', function (socket) {
	// when user clicks button 'let me chat'
	socket.on('setUsername', function(data) { // data is username string
		data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		if (users.indexOf(data) === -1) { // check if user already exists
			numUsers++;
			users.push(data);
			socket.username = data
			socket.emit('userSet', {username:data});
			io.sockets.emit('onlineUsers', numUsers);
			io.sockets.emit('displayUsers', users);
		} else {
			socket.emit('userExists', 'this username is taken.');
		}
	});

	// when server receives message, immediately broadcast it to all clients
	socket.on('msg', function(data) {
		data.message = data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		io.sockets.emit('newmsg', data);
	});

	socket.on('disconnect', function() {
		// only decrement numUsers if socket had a username, i.e. logged in
		if (socket.username) {  
			numUsers--;
			users.splice(users.indexOf(socket.username),1);
		}
		io.sockets.emit('onlineUsers', numUsers);
		io.sockets.emit('displayUsers', users);
	});
});

http.listen(process.env.PORT || 3000, function () {
	console.log('running!');
});