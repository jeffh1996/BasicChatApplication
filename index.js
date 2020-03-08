var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var isColor = require('is-color')

app.use(express.static('client'));

let users = [];
let userColor = [];
let allClients = [];
let allMessages = [];
let messagesSentBy = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  let assignUsername = users.length + 1;
  let username = "User" + assignUsername;
  socket.emit('set username', username);
  users.push(username);
  userColor.push("black");
  io.emit('user changed', users);
  socket.emit('load messages', allMessages);
  allClients.push(socket);
  socket.on('set username request', function(uname){
	if(!users.includes(uname)){
		let i = allClients.indexOf(socket);
		users[i] = uname
		socket.emit('set username', uname);
		io.emit('user changed', users);
	}
  });
  socket.on('chat message', function(msg){
	if(msg.startsWith("/")){
		if(msg.includes('/nickcolor')){
			let i = allClients.indexOf(socket);
			let checkColor = msg.substring(msg.indexOf('/nickcolor')+11);
			if(isColor(checkColor)){
				userColor[i] = checkColor;
				socket.emit('update color', checkColor);
			}
			else{
				socket.emit('error message', "SYSTEM: INVALID COLOR");
			}
		}
		else if(msg.includes('/nick')){
			let checkName = msg.substring(msg.indexOf('/nick')+6);
			if(users.includes(checkName)){
				socket.emit('error message', "SYSTEM: USER NAME ALREADY EXISTS");
			}
			else{
				let i = allClients.indexOf(socket);
				users[i] = checkName;
				socket.emit('set username', checkName);
				io.emit('user changed', users);
			}
		}
		else{
			socket.emit('error message', 'SYSTEM: INVALID COMMAND');
		}
	}
	else{
		let i = allClients.indexOf(socket);
		let currentDate = new Date();
		let minutes = currentDate.getMinutes().toString();
		if(minutes.length < 2){
			minutes = "0" + minutes;
			
		}
		let currentTime = currentDate.getHours() + ":" + minutes;
		msg = users[i] + ": " + msg;
		msg = currentTime + " " + msg;
		allMessages.push(msg);
		messagesSentBy.push(allClients.indexOf(socket));
		socket.broadcast.emit('update group chat', msg, userColor[i]);
		socket.emit('update self chat', msg);
	}
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
	let i = allClients.indexOf(socket);
	allClients.splice(i, 1);
	users.splice(i, 1);
	io.emit('user changed', users);
	
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});