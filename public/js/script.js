var socket = io(); // connects client to default namespace

function setUsername() {
	var username = document.getElementById('name').value;
	if (username) { // checks if username is non-empty
		socket.emit('setUsername', username);
	} else {
		document.getElementById('error-container').innerHTML = 
			'enter a valid username.';
	}
};

var user;
socket.on('userExists', function(data) {
	document.getElementById('error-container').innerHTML = '<span class="message">'+data+'</span>';
});
// showing normal chat interface after valid username is set
socket.on('userSet', function(data) {
	user = data.username;
	document.body.innerHTML = 
		'<div id="app-wrapper">\
		<div id="type-wrapper">\
			<input type="text" id="message">\
			<button id="message-button" type="button" name="button" onclick="sendMessage()">send</button>\
		</div>\
		<div class="container" id="users-online"></div>\
		<div class="container" id="message-container"></div>\
		<div class="container" id="user-list"></div>\
		</div>';

	// support for pressing Enter to send a message
	var chat_input = document.getElementById('message');
	chat_input.addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13) { // Enter button is keycode 13
			document.getElementById('message-button').click();
		}
	});
});

function sendMessage() {
	var msg = document.getElementById('message').value;
	if (msg) {
		socket.emit('msg', {message:msg, user:user});
	}
	document.getElementById('message').value = '';
};

socket.on('newmsg', function(data) {
	if (user) {
		document.getElementById('message-container').innerHTML +=
			'<div class="chat message"><b>'+data.user+'</b>: '+data.message+'</div>'
	}

	// auto scroll to bottom of page when new data is inserted
	var message_container = document.getElementById('message-container');
	message_container.scrollTop = message_container.scrollHeight;
});

// gives number of online users
socket.on('onlineUsers', function(num_users) {
	document.getElementById('users-online').innerHTML = 
		'<div class="message">There are <span style="color:green">'+num_users+'</span> users online.</div>'
});

// theoretically not optimal, but i don't forsee many concurrent users so it's ok
socket.on('displayUsers', function(users) {
	var i;
	document.getElementById('user-list').innerHTML = '';
	for (i = 0; i < users.length; i++) {
		document.getElementById('user-list').innerHTML +=
			'<div class="chat message">'+users[i]+'</div>'
	}
});
