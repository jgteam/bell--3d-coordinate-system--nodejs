var socket = io.connect();

var roomId = null;

function _log(event, roomid, msg) {
    if(msg == "")
        msg = "socket.on-event triggered";

    console.log("[" + event.toUpperCase() + " in Room " + roomid + "] " + msg);
}

window.createChangeRequest = createChangeRequest;
function createChangeRequest(req) {
    _log("createChangeRequest()", roomId, "Creating new change request");
    socket.emit('requestChange', req);
}

socket.on('setHost', function(value){
    _log("setHost", roomId, "Set Host status to " + value);
    baseapp.setClientIsHostingRoom(value);
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

            baseapp.createPoint(true, req.properties.color, req.properties.x, req.properties.y, req.properties.z);


        }else if(req.type == "pointConnection"){

            baseapp.createPointConnection(true, false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.start_x, req.properties.start_y, req.properties.start_z),
                baseapp.coordinatesToTHREEVector3(req.properties.end_x, req.properties.end_y, req.properties.end_z));

        }else if(req.type == "plane"){

            baseapp.createPlane(true,false, req.properties.color,
                baseapp.coordinatesToTHREEVector3(req.properties.position_a_x, req.properties.position_a_y, req.properties.position_a_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_b_x, req.properties.position_b_y, req.properties.position_b_z),
                baseapp.coordinatesToTHREEVector3(req.properties.position_c_x, req.properties.position_c_y, req.properties.position_c_z)
            );

        }

    }




});




$(document).ready(function() {
    //baseapp.setClientIsHostingRoom(false);
    //baseapp.createPoint(true,"blue", 1, 1, 1);
    //baseapp.createPoint(false,"red", 1, 2, 2);


    // https://stackoverflow.com/questions/4758103/last-segment-of-url-in-jquery
    // RoomID aus der URL auslesen
    var url = window.location.href.replace(/\/$/, '');
    var urlRoomId = url.substr(url.lastIndexOf('/') + 1);

    roomId = urlRoomId;

    _log("JOIN", roomId, "Document ready: Joining room")
    socket.emit('join', roomId);

});








