var socketio = io.connect("https://vol-chat.herokuapp.com"),
    uname,
    loggedin = 0;

/* Utility functions */

function hasWhiteSpace(str) {
	return /\s/g.test(str);
}

function hasLowerCaseNum(str) {

	var lowCaseTest = /[a-z]/;
	var numTest = /[0-9]/;

	for (var i = 0; i < str.length; i++) {
		if(!lowCaseTest.test(str[i]) && !numTest.test(str[i])){
			return 0;
		}
	};
	return 1;
}

function bottom(chatsec){
	document.getElementById(chatsec).scrollTop = document.getElementById(chatsec).scrollHeight;
}

function updateChat(str){
	document.getElementById("msg_wrap").innerHTML += str;
	
	$(document).ready(function(){
		var chat_sec = document.getElementById("chat_sec");

		chat_sec.scrollTop = chat_sec.scrollHeight;
	});
}

/* Utility functions end*/

socketio.on("avail_stat", function(data) {
   	document.getElementById("available").innerHTML = data['message'];
});

$(document).ready(function(){
    $("#uname_sub").on("click", function() {
		if(!loggedin){    
		    uname = document.getElementById("user_name").value;

			if(uname.length == 0){
		    	msg = "Username mandatory. Try again.";
		    	document.getElementById("available").innerHTML = msg;
		    }else{
			    if(hasWhiteSpace(uname)){
			    	msg = "Username cannot have white spaces. Try again.";
			    	document.getElementById("available").innerHTML = msg;
			    }else{
			    if(!hasLowerCaseNum(uname)){
			    	msg = "Username should only contain lower case alphabets. Try again.";
			    	document.getElementById("available").innerHTML = msg;
			    }else{
			    	msg = "Checking... Please wait";
					socketio.emit("avail_stat_chk", { "uname" : uname});
					document.getElementById("available").innerHTML = msg;		    				
				}
		    }
		}
	}else{
		msg = "You're already logged in. User ID: " + uname;
		document.getElementById("available").innerHTML = msg;
    }
    document.getElementById("user_name").value = "";
	});
});

socketio.on("loggedin_event_fetch", function(data) {
    loggedin = 1;
	socketio.emit("loggedin", { "uname" : uname});

	var chatPageText = '<div class = "container-fluid">';
	chatPageText+= '<div class = "alert alert-info">Logged in as: <b id = "user">' + uname + '</b></div>';
	chatPageText+= '<div class = "cont">';
	chatPageText+= '<input type = "text" placeholder = "To" class = "usr_field" id = "usr_field">';
	chatPageText+= '<div class = "chat_sec" id = "chat_sec">';
	chatPageText+= '<div id = "msg_wrap" class = "msg-wrap">';
	chatPageText+= '</div>';
	chatPageText+= '</div>';
	chatPageText+= '<input type = "text" placeholder = "Message" class = "msg_field" id = "msg_field">';
	chatPageText+= '</div>';
	chatPageText+= '</div>';

	document.getElementById("body").innerHTML = chatPageText;

	socketio.emit("chatwait", { "uname" : uname});
});

socketio.on("loginmsg", function(data) {
	updateChat(data["message"]);
});

window.onkeyup = function(e){

	if(!(document.getElementById("usr_field") == null) && !(document.getElementById("msg_field") == null)){
		var utext = document.getElementById("usr_field").value;
		var mtext = document.getElementById("msg_field").value;
	}

	if(e.keyCode == 13){
		if(utext.length == 0 || mtext.length == 0){
	    	msg = "<div class = 'message err'>Username and message field mandatory. Try again.</div>";
	    	updateChat(msg);
	    }else{
		    if(hasWhiteSpace(utext)){
		    	msg = "<div class = 'message err'>Username cannot have white spaces. Try again.</div>";
		    	updateChat(msg);
		    }else{
			    if(!hasLowerCaseNum(utext)){
			    	msg = "<div class = 'message err'>Username should only contain lower case alphabets. Try again.</div>";
			    	updateChat(msg);
			    }else{
			    	if(utext != uname){
			    		socketio.emit("chatChk", { "uname" : uname, "utext" : utext, "mtext" : mtext});
			    	}else{
			    		msg = "<div class = 'message err'>You cannot send a message to yourself. Try with another valid username. Make sure the person you are talking to is online at the moment</div>";
			    		updateChat(msg);
			    	}
				}
	    	}
		}
	}
};

socketio.on("chatsuc", function(data) {
	updateChat(data["message"]);
});

socketio.on("usrfail", function(data) {
	updateChat(data["message"]);
});

/* Chat section client js */