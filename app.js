var http = require("http"),
	fs = require("fs"),
	un = [],
	uTaken=0,
    port = process.env.PORT || 3000;

function onRequest(request, response) {
    fs.readFile("index.html", 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}

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

function htmlencode(str) {
    return str.replace(/[&<>"']/g, function($0) {
        return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
    });
}

/* Utility functions end */

var app = http.createServer(onRequest).listen(port);

var io = require('socket.io').listen(app);
 
io.sockets.on('connection', function(socket) {
    socket.on('avail_stat_chk', function(data) {

    	var uname = data["uname_msg"],
    		msg;

    	if(uname.length == 0){
    		msg = "Username mandatory";
    	}else{
    		if(hasWhiteSpace(uname)){
    			msg = "Username cannot have white spaces."
    		}else{
    			if(!hasLowerCaseNum(uname)){
    				msg = "Username should only contain lower case alphabets."
    			}else{
    				uname = htmlencode(uname);
    				for (var i = 0; i < un.length; i++) {
    					if(uname == un[i]){
    						uTaken = 1;
    						break;
    					}
    				};
    				if(uTaken){
    					msg = uname+": is taken. Try another username";
    					uTaken = 0;
    				}else{
    					un.push(uname);
    					msg = "Username successfully created: "+uname;
    				}
    			}
    		}
    	}

        io.sockets.emit("avail_stat",{ "message": msg });
    });
});

// Console will print the message
console.log('Server running');
