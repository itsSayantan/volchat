var http = require("http"),
	fs = require("fs"),
	un = [],
	uTaken=0,
    loggedIn = 0,
    port = process.env.PORT || 3000;

function onRequest(request, response) {
    if(request.method == "GET" && request.url == "/"){
        fs.readFile("index.html", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/client.js"){
        fs.readFile("client.js", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/js'});
            response.write(data);
            response.end();
        });
    }else if(request.method == "GET" && request.url == "/style.css"){
        fs.readFile("style.css", 'utf-8', function (error, data) {
            response.writeHead(200, {'Content-Type': 'text/css'});
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
            
            socket.join(uname);
            io.sockets.in(uname).emit("avail_stat",{ "message": msg });
            socket.leave(uname);
        }else{
            un.push(uname);
            msg = "Username successfully created: <span style = 'color:green;'>"+uname+"</span>";
            
            socket.join(uname);
            io.sockets.in(uname).emit("avail_stat",{ "message": msg });
            io.sockets.in(uname).emit("loggedin_event_fetch",{"msg": "loggedin"});
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

        uname = data["uname"];

        socket.join(uname);

        var msg = "<div class = 'message usrcon'><b>" + uname + "</b> logged in.</div>";

        io.sockets.in(uname).emit("loginmsg",{ "message": msg });
    });

    socket.on('chatChk', function(data) {
        uname = data["uname"];
        var utext = data["utext"],
            mtext = data["mtext"],
            ok = 0;

        socket.join(uname);

        for (var i = 0; i < un.length; i++) {
            if(un[i] == utext){
                //success
                ok=1;
                break;
            }
        };

        if(ok){
            ok=0;

            var msg = "<div class = 'message'><b class = 'u1'>" + uname + ":</b> " + mtext + "</div>";
            io.sockets.in(uname).emit("chatsuc",{ "message": msg });

            msg = "<div class = 'message'><b class = 'u2'>" + uname + ":</b> " + mtext + "</div>";
            io.sockets.in(utext).emit("chatsuc",{ "message": msg });
        }else{
            var msg = "<div class = 'message nouser'><b>" + utext + "</b> is not logged in at this moment.</div>";

            io.sockets.in(uname).emit("usrfail",{ "message": msg });
        }
    });
});

// Console will print the message
console.log('Server running at port: '+port);
