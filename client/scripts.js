let username = "";
let chatColor = "";

$(function () {
    var socket = io();
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
	  let chatMessage = $('#m').val();
      socket.emit('chat message', chatMessage);
      $('#m').val('');
      return false;
    });
	socket.on('connect', function(){
		allCookies = document.cookie;
		let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		if(cookieValue !== ""){
			socket.emit('set username request', cookieValue);
		}
	});
	socket.on('set username', function(uname){
		username = uname;
		$('#currentUser').text("You are: " + uname);
		document.cookie = "username=" + uname;
	});
	socket.on('user changed', function(users){
	  $('#userList').empty();
	  for(var i = 0; i < users.length; i++){
		$('#userList').append($('<li>').text(users[i]));
	  }
    });
	socket.on('load messages', function(messages){
	  $('#messages').empty();
	  for(var i = 0; i < messages.length; i++){
		$('#messages').append($('<li>').text(messages[i]));
	  }
	  $('#messageBox').scrollTop($('#messageBox')[0].scrollHeight);
    });
	socket.on('update group chat', function(msg, userColor){
      $('#messages').append($('<li>').text(msg).css({"color": userColor}));
	  $('#messageBox').scrollTop($('#messageBox')[0].scrollHeight);
    });
	socket.on('update self chat', function(msg){
      $('#messages').append($('<li>').text(msg).css({"font-weight": "Bold", "color": chatColor}));
	  $('#messageBox').scrollTop($('#messageBox')[0].scrollHeight);
    });
	socket.on('update color', function(color){
		chatColor = color;
	});
	socket.on('error message', function(msg){
		$('#messages').append($('<li>').text(msg));
		$('#messageBox').scrollTop($('#messageBox')[0].scrollHeight);
	});
});