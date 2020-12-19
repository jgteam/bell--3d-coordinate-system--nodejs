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

function _log(event, roomid, msg) {
    if(msg == "")
        msg = "socket.on-event triggered";

    console.log("[" + event.toUpperCase() + " in Room " + roomid + "] " + msg);
}

// Express Request Handler
app.get(['/', '/room'], function(req, res){
    res.sendFile(__dirname + '/index/index.html');
});

app.use('/index/', express.static('index'));

app.get('/room/:id([0-9]{' + roomIdMinLenght + ',})', function(req, res){
    res.sendFile(__dirname + '/base/index.html');
});

app.use(['/room/:id([0-9]{' + roomIdMinLenght + ',})', '/room/'], express.static('base'));

app.get('/api/socket', function(req, res){
    res.sendFile(__dirname + '/api/socket-client.js');
});

app.get('/api/isRoomTaken/:id', function(req, res){
    var isTaken = !(roomIdClientCounter[req.params.id] === undefined || roomIdClientCounter[req.params.id] === 0)

    res.json({isTaken: isTaken});
});

app.get('/api/getNewRoomId', function(req, res){
    var roomId = Math.ceil(Math.random() * 899999) + 100000;

    while(!(roomIdClientCounter[roomId] === undefined || roomIdClientCounter[roomId] === 0)) {
        roomId = Math.ceil(Math.random() * 899999) + 100000;
    }

    res.json({roomId: roomId});
});


/*app.get('/api/:function/:parameter', function(req, res){
    res.json(
        {
            function: req.params.function,
            parameter: req.params.parameter
        }
    );
});*/

// Start Listening for Request
http.listen(port, function(){
    console.log('Listening on port ' + port);
});

// Socket.io Handler
io.sockets.on('connection', function(socket) {

    socket.on('join', function(roomId) {

        if(roomIdRegEx.test(roomId)){
            roomId += "";


            if (roomIdClientCounter[roomId] === undefined) {
                roomIdClientCounter[roomId] = 1;
                socket.emit('setHost', true);
            } else {
                roomIdClientCounter[roomId]++;
                socket.emit('setHost', false);

                // SEND CURRENT STATE TO CLIENT

            }



            socket.join(roomId);
            socket.roomId = roomId;

            _log("join", roomId, "New user. Usercount: " + roomIdClientCounter[roomId]);
            io.in(socket.roomId).emit('updateUsercount', roomIdClientCounter[socket.roomId]);
        } else {
            socket.disconnect(true);
        }

    });

    socket.on('requestChange', function(req) {

        // req: Beinhaltet die gewünschte Aktion

        _log("requestChange", socket.roomId, "New change requested");

        io.in(socket.roomId).emit('sendRequestToHost', req);

    });

    socket.on('grantChange', function(reqAndCounters) {

        // reqAndCounters: Beinhaltet die gewünschte Aktion und Variablen wie die Zähler für Punkt, Strecke und Fläche

        _log("grantChange", socket.roomId, "New change granted. Broadcasting now...");

        io.in(socket.roomId).emit('broadcastChange', reqAndCounters);

    });

    socket.on('ping', function(roomId) {
        if (roomIdClientCounter[roomId] === undefined) {
            // room doesnt exist, server restarted?
        }
        socket.emit('pong');
    });

    socket.on('pushCameraAndMousePosition', function(cameraAndMousePosition) {
        io.in(socket.roomId).emit('broadcastCameraAndMousePosition', cameraAndMousePosition);
    });

    socket.on('pushMirroringState', function(active) {
        io.in(socket.roomId).emit('broadcastMirroringState', active);
    });

});

io.sockets.on('disconnect', function (socket) {
    roomIdClientCounter[socket.roomId]--;
    _log("disconnect", socket.roomId, "User disconnected. Usercount: " + roomIdClientCounter[socket.roomId]);
    io.in(socket.roomId).emit('updateUsercount', roomIdClientCounter[socket.roomId]);
});