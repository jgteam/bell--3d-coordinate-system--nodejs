// --- Setup and Dependencies

const express = require('express');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);
// Socket.io Cheatsheet: https://gist.github.com/alexpchin/3f257d0bb813e2c8c476

// --- Config
const roomIdMinLenght = 3; // Mindestlänge der roomId
const roomIdRegEx = new RegExp('[0-9]{' + roomIdMinLenght + ',}'); // RegEx der roomId

// Hinweis: Aktuell werden die geöffneten Räume in einem JS-Objekt gespeichert. Diese Umsetzung ist suboptimal.
// Eigentlich wäre eine passende Lösung die roomIds und Nutzerzahlen in eine Datenbank abzulegen.
// Da ich aber die nicht exzessiv Nutzung ohne die Einrichtung einer Datenbank ermöglichen will,
// wird hier die nicht optimale Lösung beibehalten.
var roomIdClientCounter = {};
// https://stackoverflow.com/a/31468607

const port = process.env.PORT || "3000";





// --- Functions
// Console-Logging-Funktion für die Socket-Handlers
function _log(event, roomid, msg) {
    if(msg == "")
        msg = "socket.on-event triggered";

    console.log("[" + event.toUpperCase() + " in Room " + roomid + "] " + msg);
}

// Gibt zurück, ob die roomId schon vergeben ist
function isRoomTaken(roomId) {

    return !(roomIdClientCounter[roomId] === undefined || roomIdClientCounter[roomId] === 0);

}





// --- Express Routes
// Die Stamm-URL verweist auf die index.html der Index-Seite
app.get('/', function(req, res){

    res.sendFile(__dirname + '/index/index.html');

});

// "/index/" verweist auf den Ordner der Index-Seite, damit man auf die benötigten Ressourcen der index/index.html zugreifen kann
app.use('/index/', express.static('index'));

// Eine gültige Raum-URL verweist auf die index.html der Raum-Seite (Base-Ordner)
app.get('/room/:id([0-9]{' + roomIdMinLenght + ',})', function(req, res){

    res.sendFile(__dirname + '/base/index.html');

});

// Eine gültige Raum-URL bzw. "/room/" verweist auf den Ordner der Raum-Seite (Base-Ordner)
app.use(['/room/:id([0-9]{' + roomIdMinLenght + ',})', '/room/'], express.static('base'));

// "/api/socket" verweist auf die socket-client.js-Datei (-> Stackspezifische Gegenstück für die Implementierung der Websockets im Frontend)
app.get('/api/socket', function(req, res){

    res.sendFile(__dirname + '/api/socket-client.js');

});

// Über "/api/isRoomTaken/{roomId}" kann man die Verfügbarkeit von Räumen abfragen
app.get('/api/isRoomTaken/:id', function(req, res){

    // Schaut ob das JS-Objekt schon einen "Eintrag" hat oder dieser keine nutzer hat
    var isTaken = isRoomTaken(req.params.id);

    // Ergebnis wird zurückgegeben
    res.json({isTaken: isTaken});

});

// "/api/getNewRoomId" gibt eine verfügbare roomId zurück
// Hinweis: Diese Umsetzung ist suboptimal
app.get('/api/getNewRoomId', function(req, res){
    // Generiert zufällige roomId
    var roomId = Math.ceil(Math.random() * 899999) + 100000;

    // Falls diese schon vergeben ist, wird eine neue roomId generiert
    while(isRoomTaken(roomId)) {
        roomId = Math.ceil(Math.random() * 899999) + 100000;
    }

    // Ergebnis wird zurückgegeben
    res.json({roomId: roomId});
});






// --- Start listening (HTTP)
http.listen(port, function(){
    console.log('Listening on port ' + port);
});






// --- Socket.io Handler
io.sockets.on('connection', function(socket) {

    // "join"-Event
    socket.on('join', function(roomId) {

        // Überprüft, ob die roomId der RegEx entspricht
        if(roomIdRegEx.test(roomId)){

            roomId += ""; // Cast zu einem String

            // Überprüft, ob die roomId schon vergeben ist
            if (!isRoomTaken(roomId)) {
                // ... ist noch frei

                // Raum in Zähler speichern
                roomIdClientCounter[roomId] = 1;

                // Schickt an den einzelnen Client zurück, dass dieser die Host-Rolle hat
                socket.emit('setHost', true);

            } else {
                // ... ist vergeben

                // Raumzähler hochzählen
                roomIdClientCounter[roomId]++;

                // Schickt an den einzelnen Client zurück, dass dieser die Host-Rolle nicht hat
                socket.emit('setHost', false);

                // Schickt an alle Clients im Raum ein "getCurrentState", und fragt nach dem aktuellen Stand des Koordinatensystems
                // ! Nur der Host wird diese Nachricht verarbeiten
                io.in(roomId).emit('getCurrentState');
                _log("join", roomId, "Requesting currentState from host.");

            }

            // Client tritt dem Socket-Room bei
            socket.join(roomId);

            // Client wird die roomId als Eigenschaft zugewiesen
            socket.roomId = roomId;

            _log("join", roomId, "New user. Usercount: " + roomIdClientCounter[roomId]);
            // Schickt an alle Clients im Raum ein "updateUsercount", mit der aktuellen Nutzerzahl des Raumes
            io.in(socket.roomId).emit('updateUsercount', roomIdClientCounter[socket.roomId]);

        } else {

            // Trennt die Socket-Verbindung
            socket.disconnect(true);

        }

    });

    // "uploadCurrentState"-Event
    socket.on('uploadCurrentState', function(json) {

        _log("uploadCurrentState", socket.roomId, "Deploying uploaded State.");

        // Schickt an alle Clients im Raum ein "deployCurrentState", mit dem aktuellen Stand des Koordinatensystems
        io.in(socket.roomId).emit('deployCurrentState', json);

    });

    // "requestChange"-Event
    // req -> Request (beinhaltet die angefragte Änderung)
    socket.on('requestChange', function(req) {

        _log("requestChange", socket.roomId, "New change requested");

        // Schickt an alle Clients im Raum ein "sendRequestToHost", mit der angefragte Änderung.
        // ! Nur der Host wird diese Nachricht verarbeiten
        io.in(socket.roomId).emit('sendRequestToHost', req);

    });

    // "grantChange"-Event
    // req -> Request (beinhaltet die angefragte Änderung)
    // counters (beinhaltet die aktuellen Zählerstände)
    socket.on('grantChange', function(reqAndCounters) {

        _log("grantChange", socket.roomId, "New change granted. Broadcasting now...");

        // Schickt an alle Clients im Raum ein "broadcastChange", mit der auszuführenden Änderung und den Zählern
        io.in(socket.roomId).emit('broadcastChange', reqAndCounters);

    });

    // "pushCameraAndMousePosition"-Event
    socket.on('pushCameraAndMousePosition', function(cameraAndMousePosition) {

        // Schickt an alle Clients im Raum ein "broadcastCameraAndMousePosition", mit der aktuellen Kamera und Maus position
        io.in(socket.roomId).emit('broadcastCameraAndMousePosition', cameraAndMousePosition);

    });

    // "pushMirroringState"-Event
    socket.on('pushMirroringState', function(active) {

        // Schickt an alle Clients im Raum ein "broadcastMirroringState", mit dem aktuellen Stand, ob das Spiegeln aktiviert ist oder nicht
        io.in(socket.roomId).emit('broadcastMirroringState', active);

    });

    // "ping"-Event
    socket.on('ping', function(roomId) {

        /* if (!isRoomTaken(roomId)) { room doesnt exist, server restarted (nodemon)? } */

        // Schickt an den einzelnen Client ein "pong" zurück
        socket.emit('pong');

    });

});


// Hinweis: Das disconnect-Event ist nicht zuverlässig und wird nicht immer ausgelöst (siehe README.md -> "Weitere Hinweise")
io.sockets.on('disconnect', function (socket) {
    roomIdClientCounter[socket.roomId]--;
    _log("disconnect", socket.roomId, "User disconnected. Usercount: " + roomIdClientCounter[socket.roomId]);
    io.in(socket.roomId).emit('updateUsercount', roomIdClientCounter[socket.roomId]);
});