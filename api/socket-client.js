// Clientseitiges Script für die WebSockets

// Erstellt ein neues Socket-instanz
// Eine Domain/Serveradresse müssen wir nicht angegeben, da wir mit der selben Domain auf den Socket-Server zugreifen,
// mit welcher wir auch auf den Web-Server zugreifen. Der Port bleibt der
var socket = io.connect();

// Speichert wenn das Dokument geladen hat dir RaumId
var roomId = null;

// Gibt an, ob die aktuelle Instanz des Clients auf den aktuellen Stand des Koordinatensystems des Hosts wartet.
var waitingForCurrentState = true;

// Log-Funktion, welche das ausschlaggebende Ereignis, die dazugehörige roomId und die optionale Nachricht formatiert
// in der Konsole ausgibt (Genutzt für die verschiedenen socket.on-Events)
function _log(event, roomid, msg) {
    if(msg == "")
        msg = "socket.on-event triggered"; // Sollte keine Nachricht angegeben worden sein

    console.log("[" + event.toUpperCase() + " in Room " + roomid + "] " + msg);
}

// gibt den aktuellen Nutzernamen (Benutzername-Feld) des Clients zurück.
function getUsername() {
    const usernameInput = $("#connection-overview .username"); // input-Element des Nutzernamens
    return (usernameInput.val() != "") ? usernameInput.val() : "Nutzer ohne Name";
    // Wenn kein Nutzername angegeben: "Nutzer ohne Name"
}

// Nimmt ein Request-Objekt und hängt den Nutzernamen des Erstellers an das Request-Objekt
function appendUsernameToRequest(req) {
    req.username = getUsername();
    return req;
}

// Funktion für die Erstellung von Requests, welche dann über den Socket übermittelt werden.
// Diese Funktion wird in der /base/js/main.js benutzt.
window.createChangeRequest = createChangeRequest;
function createChangeRequest(req) {
    // Event loggen und dann die Request mit dem angehängten Nutzernamen übermitteln
    _log("createChangeRequest()", roomId, "Creating new change request");
    socket.emit('requestChange', appendUsernameToRequest(req));
}


// --- SOCKET.ON-Funktionen

// Bei Übermittlung, ob der Client die Host-Rolle besitzt oder nicht
socket.on('setHost', function(isHost){
    _log("setHost", roomId, "Set Host status to " + isHost);

    // Setzt die Rolle mit der setClientIsHostingRoom-Funktion für die /base/js/main.js
    baseapp.setClientIsHostingRoom(isHost);

    if(isHost == true){
        // Wenn der Client Host ist...

        // Rolle anzeigen
        $("#connection-overview .userrole .value").text("Host");
        // Rollen-CSS-Klasse setzten
        $("body").addClass("host");

        // Mitteilen, dass wir nicht mehr auf den aktuellen Stand des Koordinatensystems warten, da wir schließlich
        // der Host sind, und somit auch den Raum als erstes betreten haben. Somit ist der Raum leer und wir müssen
        // auf keinen schon vorhandenen Stand warten.
        waitingForCurrentState = false;

        // Erstellung der Willkommensnachricht
        baseapp.createNotification("info", "Du bist erfolgreich dem Raum beigetreten. Dir wurde die Rolle 'Host' zugeordnet, da Du der erste Nutzer in diesem Raum bist. Du kannst Deinen Namen oben in das Feld eintragen und dann über den Link oder die ID Leute einladen.");
    } else {
        // Wenn der Client kein Host ist...

        // Rolle anzeigen
        $("#connection-overview .userrole .value").text("Guest");

        // Erstellung der Willkommensnachricht
        baseapp.createNotification("info", "Du bist erfolgreich dem Raum beigetreten. Dir wurde die Rolle 'Guest' zugeordnet. Du kannst Deinen Namen oben in das Feld eintragen und dann über den Link oder die ID Leute einladen.");
    }
});

// Wenn der aktuelle Stand des Koordinatensystems durch einen Client angefordert wird
socket.on('getCurrentState', function(){
    _log("getCurrentState", roomId, "CurrentState was requested.");
    if(baseapp.getClientIsHostingRoom() !== true) return; // Funktion abbrechen, falls dieser Client nicht der Host ist
    _log("getCurrentState", roomId, "Uploading currentState as host.");
    socket.emit('uploadCurrentState', baseapp.exportAsJSON()); // Übermittelt den aktuellen Stand in JSON format
});

// Wenn der aktuelle Stand des Koordinatensystems vom Host durch den Server übermittelt wurde
socket.on('deployCurrentState', function(json){
    _log("deployCurrentState", roomId, "Received currentState.");
    if(!waitingForCurrentState) return; // Funktion abbrechen, falls man nicht auf den aktuellen Stand warten sollte
    _log("deployCurrentState", roomId, "Importing currentState.");

    baseapp.importJSON(json, true);
    // Importiert das Koordinatensystem mit dem Parameter fromsocket=true

    waitingForCurrentState = false;
    // Setzt den Status für das Warten auf false
});

// Wenn eine neue Nutzerzahl für den Raum übermittelt wird
socket.on('updateUsercount', function(userCount){
    // Nutzerzahl-Text neu setzen
    $("#connection-overview .usercount .value").text(userCount);
});

// Wenn der Host eine changeRequest übermittelt bekommt
socket.on('sendRequestToHost', function(req){
    _log("sendRequestToHost", roomId, "Receiving change request for review (HOST ONLY)");

    if(baseapp.getClientIsHostingRoom() !== true){
        // Falls der Client kein Host sein sollte
        _log("sendRequestToHost", roomId, "Not reviewing request, because guest status");
        return; // Funktion abbrechen
    }
    _log("sendRequestToHost", roomId, "Reviewing request as host. Sending 'grantChange'");

    baseapp.increaseBroadcastCounter(req.type);
    // Erhöht den Übertragungszähler vom passenden Typ der Anfrage

    socket.emit('grantChange', {req: req, counters: baseapp.getCounters()});
    // Übermittelt die bewilligte Änderung mit den aktuellen Zählern
});

// Wenn eine bewilligte Änderung übermittelt wurde
socket.on('broadcastChange', function(reqAndCounters){
    _log("broadcastChange", roomId, "Receiving granted change request");

    // Zähler neu setzen
    var counters = reqAndCounters.counters;
    baseapp.setCounters(counters);

    var req = reqAndCounters.req;
    _log("broadcastChange", roomId, "Request: " + req);

    if(req.action == "create") {
        // Falls es eine Änderung vom Typ "create" ist

        if(req.type == "point"){
            // Falls ein Punkt erstellt wurde

            // Update-Nachricht erstellen
            baseapp.createNotification("update", req.username + " hat Punkt Nr. " + reqAndCounters.counters.points + " erstellt.");

            // Punkt erstellen
            baseapp.createPoint(true, req.properties.color, req.properties.x, req.properties.y, req.properties.z);

        }else if(req.type == "pointConnection"){
            // Falls eine Strecke erstellt wurde

            // Update-Nachricht erstellen
            baseapp.createNotification("update", req.username + " hat Strecke Nr. " + reqAndCounters.counters.pointConnections + " erstellt.");

            // Strecke erstellen
            baseapp.createPointConnection(true, false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.start_x, req.properties.start_y, req.properties.start_z),
                baseapp.coordinatesToTHREEVector3(req.properties.end_x, req.properties.end_y, req.properties.end_z));

        }else if(req.type == "plane"){
            // Falls eine Ebene erstellt wurde

            // Update-Nachricht erstellen
            baseapp.createNotification("update", req.username + " hat Ebene Nr. " + reqAndCounters.counters.planes + " erstellt.");

            // Ebene erstellen
            baseapp.createPlane(true,false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.position_a_x, req.properties.position_a_y, req.properties.position_a_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_b_x, req.properties.position_b_y, req.properties.position_b_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_c_x, req.properties.position_c_y, req.properties.position_c_z)
            );

        }

    } else if (req.action == "delete") {
        // Falls es eine Änderung vom Typ "delete" ist

        // Update-Nachricht erstellen
        baseapp.createNotification("update", req.username + " hat " +  req.properties.objectClass.split("-").pop().replace("pointConnection", "Strecke Nr. ").replace("point", "Punkt Nr. ").replace("plane", "Ebene Nr. ") + " gelöscht.");

        // Löschung ausführen
        baseapp.executeDeleteObject(req.properties.objectClass, req.type);
    }

});

// Übermittlung von Start oder Ende der Spiegelung
socket.on('broadcastMirroringState', function(active){
    if(baseapp.getClientIsHostingRoom() === true) return; // Funktion abbrechen, falls es sich um den Host handeln sollte
    if(active){
        // Wenn die Spiegelung gestartet wurde

        // CSS-Klasse setzen
        $("body").addClass("mirrored");

        // werkzeuge zurücksetzen
        baseapp.setRendererUserMode("move");

        // Spiegelung-Nachricht erstellen
        baseapp.createNotification("info", "Spiegelung gestartet. Während der Spiegelung sind die Bearbeitungswerkzeuge deaktiviert.");
    } else {
        // Wenn die Spiegelung gestoppt wurde

        // CSS-Klasse entfernen
        $("body").removeClass("mirrored");

        // Spiegelung-Nachricht erstellen
        baseapp.createNotification("info", "Spiegelung gestoppt. Die Bearbeitung ist wieder freigegeben.");
    }
});

// Übertragung der Kamera- und Mausposition (für die Spiegelung)
socket.on('broadcastCameraAndMousePosition', function(cameraPosition){
    if(baseapp.getClientIsHostingRoom() === true) return; // Funktion abbrechen, falls Host

    // Kamera und Maus setzen
    baseapp.setCameraAndMousePosition(cameraPosition);
});

// Funktion für das Übermitteln der Kamera- und Mausposition
function pushCameraPosition() {
    if(baseapp.getClientIsHostingRoom() !== true) return; // Falls nicht Host, Funktion abbrechen

    // Kamera und Maus übertragen
    socket.emit('pushCameraAndMousePosition', baseapp.getCameraAndMousePosition());
}

// ID für das Interval, welches die Spiegelung ermöglicht
var intervalID = null;

// Startet das Interval und speichert die ID
function startMirroring() {
    intervalID = window.setInterval(pushCameraPosition,16);
}

// Stoppt das Interval über die ID
function stopMirroring() {
    clearInterval(intervalID);
    intervalID = null;
}

// Uhrzeit für den zuletzt ausgesendeten Ping (für die spätere Berechnung)
var lastPing = 0;

// Wenn der Ping zurück kommt
socket.on('pong', function(){
    var pingMS = (Date.now() - lastPing); // Ping berechnet
    $("#connection-overview .ping-server .value").text(pingMS).css({color: "#292929"}); // Ping anzeigen
});

// Ping aussenden
function ping() {
    $("#connection-overview .ping-server .value").text("-").css({color: "red"});
    lastPing = Date.now();
    socket.emit('ping', roomId);
}

// Ping Interval
window.setInterval(function(){
    ping();
}, 10000);

// Wenn das Dokument geladen hat
$(document).ready(function() {
    // https://stackoverflow.com/questions/4758103/last-segment-of-url-in-jquery
    // RoomID aus der URL auslesen
    var url = window.location.href.replace(/\/$/, '');
    var urlRoomId = url.substr(url.lastIndexOf('/') + 1);

    roomId = urlRoomId;
    $("#connection-overview .roomid .value").text(roomId); // roomID anzeigen

    _log("JOIN", roomId, "Document ready: Joining room")
    socket.emit('join', roomId); // Join-Befehl über Sockets übermitteln


    // https://www.sanwebe.com/2013/02/confirmation-dialog-on-leaving-page-javascript#:~:text=If%20you%20want%20to%20show,leave%20or%20reload%20the%20page.
    // Versehentliche Tabschließungen verhindern
    $(window).bind('beforeunload', function(){
        return "Willst du diesen Raum wirklich verlassen?";
    });
});








