var http = require("http"),
	fs = require("fs"),
	un = [],
	uTaken=0,
    loggedIn = 0,
    port = process.env.PORT || 3000;

function onRequest(request, response) {
    if(request.method == "GET" && request.url == "/chat"){
        fs.readFile("chat.html", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/"){
        fs.readFile("index.html", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }else{
        fs.readFile("error404.html", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }
}

/* Utility functions */

function htmlencode(str) {
    return str.replace(/[&<>"']/g, function($0) {
        return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
    });
}

/* Utility functions end */

var app = http.createServer(onRequest).listen(port);

var io = require('socket.io').listen(app);
 
io.sockets.on('connection', function(socket) {

    var uname = "A user";

    console.log(uname + " connected");

    socket.on('avail_stat_chk', function(data) {

        var msg;
        uname = data["uname"];

        socket.join(uname);

        uname = htmlencode(uname);
        for (var i = 0; i < un.length; i++) {
                if(uname == un[i]){
                uTaken = 1;
                break;
            }
        };
        if(uTaken){
            msg = "<span style = 'color:red;'>"+uname+"</span> is taken. Try again.<div>If you are already logged in with this id, then you are probably receiving this message because someone else is trying to log in with this id. Please ignore.</div>";
            uTaken = 0;
            io.sockets.in(uname).emit("avail_stat",{ "message": msg });
        }else{
            un.push(uname);
            msg = "Username successfully created: <span style = 'color:green;'>"+uname+"</span>";
            io.sockets.in(uname).emit("loggedin_event_fetch",{"msg": "loggedin"});
            io.sockets.in(uname).emit("avail_stat",{ "message": msg });
        }
    });

    socket.on('disconnect', function(data) {
        if(uname != "A user"){
            un.splice(un.indexOf(data["uname"]), 1);
        }
        console.log(uname + " disconnected");
    });

    socket.on('loggedin', function(data) {
        console.log(uname + " logged in.");
    });
});

// Console will print the message
console.log('Server running at port: '+port);