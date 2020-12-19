var socket = io.connect();

var roomId = null;

var waitingForCurrentState = true;

function _log(event, roomid, msg) {
    if(msg == "")
        msg = "socket.on-event triggered";

    console.log("[" + event.toUpperCase() + " in Room " + roomid + "] " + msg);
}

function getUsername() {
    return ($("#connection-overview .username").val() != "") ? $("#connection-overview .username").val() : "Nutzer ohne Name";
}

function appendUsernameToRequest(req) {
    req.username = getUsername();
    return req;
}

window.createChangeRequest = createChangeRequest;
function createChangeRequest(req) {
    _log("createChangeRequest()", roomId, "Creating new change request");
    socket.emit('requestChange', appendUsernameToRequest(req));
}

socket.on('setHost', function(value){
    _log("setHost", roomId, "Set Host status to " + value);
    baseapp.setClientIsHostingRoom(value);
    if(value == true){
        $("#connection-overview .userrole .value").text("Host");
        $("body").addClass("host");
        waitingForCurrentState = false;
        baseapp.createNotification("info", "Du bist erfolgreich dem Raum beigetreten. Dir wurde die Rolle 'Host' zugeordnet, da Du der erste Nutzer in diesem Raum bist. Du kannst Deinen Namen oben in das Feld eintragen und dann über den Link oder die ID Leute einladen.");
    } else {
        $("#connection-overview .userrole .value").text("Guest");
        baseapp.createNotification("info", "Du bist erfolgreich dem Raum beigetreten. Dir wurde die Rolle 'Guest' zugeordnet. Du kannst Deinen Namen oben in das Feld eintragen und dann über den Link oder die ID Leute einladen.");
    }
});

socket.on('getCurrentState', function(){
    _log("getCurrentState", roomId, "CurrentState was requested.");
    if(baseapp.getClientIsHostingRoom() !== true) return;
    _log("getCurrentState", roomId, "Uploading currentState as host.");
    socket.emit('uploadCurrentState', baseapp.exportAsJSON());
});

socket.on('deployCurrentState', function(json){
    _log("deployCurrentState", roomId, "Received currentState.");
    if(!waitingForCurrentState) return;
    _log("deployCurrentState", roomId, "Importing currentState.");
    baseapp.importJSON(json, true);
    waitingForCurrentState = false;
});

socket.on('updateUsercount', function(value){
    $("#connection-overview .usercount .value").text(value);
});

socket.on('sendRequestToHost', function(req){
    _log("sendRequestToHost", roomId, "Receiving change request for review (HOST ONLY)");

    if(baseapp.getClientIsHostingRoom() !== true){
        _log("sendRequestToHost", roomId, "Not reviewing request, because guest status");
        return;
    }
    _log("sendRequestToHost", roomId, "Reviewing request as host. Sending 'grantChange'");

    baseapp.updateBroadcastCounter(req.type);
    socket.emit('grantChange', {req: req, counters: baseapp.getCounters()});
});

socket.on('broadcastChange', function(reqAndCounters){
    _log("broadcastChange", roomId, "Receiving granted change request");

    var counters = reqAndCounters.counters;
    baseapp.setCounters(counters);

    var req = reqAndCounters.req;
    _log("broadcastChange", roomId, "Request: " + req);

    if(req.action == "create") {

        if(req.type == "point"){

            baseapp.createNotification("update", req.username + " hat Punkt Nr. " + reqAndCounters.counters.points + " erstellt.");

            baseapp.createPoint(true, req.properties.color, req.properties.x, req.properties.y, req.properties.z);

        }else if(req.type == "pointConnection"){

            baseapp.createNotification("update", req.username + " hat Strecke Nr. " + reqAndCounters.counters.pointConnections + " erstellt.");

            baseapp.createPointConnection(true, false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.start_x, req.properties.start_y, req.properties.start_z),
                baseapp.coordinatesToTHREEVector3(req.properties.end_x, req.properties.end_y, req.properties.end_z));

        }else if(req.type == "plane"){

            baseapp.createNotification("update", req.username + " hat Ebene Nr. " + reqAndCounters.counters.planes + " erstellt.");

            baseapp.createPlane(true,false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.position_a_x, req.properties.position_a_y, req.properties.position_a_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_b_x, req.properties.position_b_y, req.properties.position_b_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_c_x, req.properties.position_c_y, req.properties.position_c_z)
            );

        }

    } else if (req.action == "delete") {

        baseapp.createNotification("update", req.username + " hat " +  req.properties.objectClass.split("-").pop().replace("pointConnection", "Strecke Nr. ").replace("point", "Punkt Nr. ").replace("plane", "Ebene Nr. ") + " gelöscht.");
        baseapp.executeDeleteObject(req.properties.objectClass, req.type);

    }




});

socket.on('broadcastMirroringState', function(active){
    if(baseapp.getClientIsHostingRoom() === true) return;
    if(active){
        $("body").addClass("mirrored");
        baseapp.setRendererUserMode("move");
        baseapp.createNotification("info", "Spiegelung gestartet. Während der Spiegelung sind die Bearbeitungswerkzeuge deaktiviert.");
    } else {
        $("body").removeClass("mirrored");
        baseapp.createNotification("info", "Spiegelung gestoppt. Die Bearbeitung ist wieder freigegeben.");
    }
});

socket.on('broadcastCameraAndMousePosition', function(cameraPosition){
    if(baseapp.getClientIsHostingRoom() === true) return;

    baseapp.setCameraAndMousePosition(cameraPosition);

});

function pushCameraPosition() {
    if(baseapp.getClientIsHostingRoom() !== true) return;

    socket.emit('pushCameraAndMousePosition', baseapp.getCameraAndMousePosition());

}

var timeoutID = null;

function startMirroring() {

    timeoutID = window.setInterval(pushCameraPosition,16);

}

function stopMirroring() {

    clearInterval(timeoutID);
    timeoutID = null;

}

var lastPing = 0;

socket.on('pong', function(){
    var pingMS = (Date.now() - lastPing);
    $("#connection-overview .ping-server .value").text(pingMS).css({color: "#292929"});
});

function ping() {
    $("#connection-overview .ping-server .value").text("-").css({color: "red"});
    lastPing = Date.now();
    socket.emit('ping', roomId);
}

window.setInterval(function(){
    ping();
}, 10000);

$(document).ready(function() {
    //baseapp.setClientIsHostingRoom(false);
    //baseapp.createPoint(true,"blue", 1, 1, 1);
    //baseapp.createPoint(false,"red", 1, 2, 2);


    // https://stackoverflow.com/questions/4758103/last-segment-of-url-in-jquery
    // RoomID aus der URL auslesen
    var url = window.location.href.replace(/\/$/, '');
    var urlRoomId = url.substr(url.lastIndexOf('/') + 1);

    roomId = urlRoomId;
    $("#connection-overview .roomid .value").text(roomId);

    _log("JOIN", roomId, "Document ready: Joining room")
    socket.emit('join', roomId);


    // https://www.sanwebe.com/2013/02/confirmation-dialog-on-leaving-page-javascript#:~:text=If%20you%20want%20to%20show,leave%20or%20reload%20the%20page.
    $(window).bind('beforeunload', function(){
        return "Willst du diesen Raum wirklich verlassen?";
    });

});








