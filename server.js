const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const Watcher = require('./watcher');

let watcher = new Watcher("test.log");

watcher.start();

app.get('/logger', (req, res, next) => {
    console.log("Client received the request");
    var options = {
        root: path.join(__dirname)
    };

    const fileName = 'index.html'; // Fixed variable name

    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

io.on('connection', function(socket){
    console.log("new connection established:"+socket.id);

    watcher.on("process", function process(data) {
        socket.emit("update-log", data);
    });

    let data = watcher.getLogs();
    socket.emit("init", data);
});


app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));


http.listen(4000, function(){
    console.log('listening on localhost:4000');
});
