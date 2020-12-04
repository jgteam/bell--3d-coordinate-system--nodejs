const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// https://gist.github.com/alexpchin/3f257d0bb813e2c8c476

const roomIdMinLenght = 3;
const roomIdRegEx = new RegExp('[0-9]{' + roomIdMinLenght + ',}');
var roomIdClientCounter = {};
// https://stackoverflow.com/a/31468607

const port = process.env.PORT || "3000";


// Express Request Handler
app.get(['/', '/room'], function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/room/:id([0-9]{' + roomIdMinLenght + ',})', function(req, res){
    res.sendFile(__dirname + '/base/index.html');
});

app.use(['/room/:id([0-9]{' + roomIdMinLenght + ',})', '/room/'], express.static('base'));

app.get('/api/socket', function(req, res){
    res.sendFile(__dirname + '/api/socket-client.js');
});

app.get('/api/isRoomTaken/:id([0-9]{' + roomIdMinLenght + ',})', function(req, res){
    var isTaken = !(roomIdClientCounter[req.params.id] === undefined || roomIdClientCounter[req.params.id] === 0)

    res.json({isTaken: isTaken});
});


app.get('/api/:function/:parameter', function(req, res){
    res.json(
        {
            function: req.params.function,
            parameter: req.params.parameter
        }
    );
});

// Start Listening for Request
http.listen(port, function(){
    console.log('Listening on port ' + port);
});

// Socket.io Handler
io.sockets.on('connection', function(socket) {

    socket.on('joinRoom', function(roomId) {

        if(roomIdRegEx.test(roomId)){
            roomId += "";


            if (roomIdClientCounter[roomId] === undefined) {
                roomIdClientCounter[roomId] = 1;
                socket.emit('setHost', true);
            } else {
                roomIdClientCounter[roomId]++;
                socket.emit('setHost', false);
            }



            console.log("Room " + roomId + ": UserCount: " + roomIdClientCounter[roomId]);

            socket.join(roomId);
            socket.roomId = roomId;
        } else {
            socket.disconnect(true);
        }

    });

    socket.on('socketRequest', function(req) {

        console.log("Room " + socket.roomId + ": New SocketRequest");

        io.in(socket.roomId).emit('executeSocketRequest', req);

    });

    socket.on('broadcastSocketRequest', function(reqAndCounters) {

        console.log("Room " + socket.roomId + ": New BroadcastSocketRequest");

        io.in(socket.roomId).emit('deploySocketRequest', reqAndCounters);

    });

});

io.sockets.on('disconnect', function (socket) {
    roomIdClientCounter[socket.roomId]--;
    console.log("Room " + socket.roomId + ": UserCount: " + roomIdClientCounter[socket.roomId]);
});