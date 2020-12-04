var socket = io.connect();


window.createSocketRequest = createSocketRequest;
function createSocketRequest(req) {
    socket.emit('socketRequest', req);
}

socket.on('setHost', function(value){
    baseapp.setClientIsHostingRoom(value);
    console.log("IsRoomHost: " + value);
});

socket.on('executeSocketRequest', function(req){
    if(baseapp.getClientIsHostingRoom() !== true){
        console.log("executeSocketRequest: not the Host, not executing");
        return;
    }
    console.log("executeSocketRequest: executing as Host");
    socket.emit('broadcastSocketRequest', {req: req, counters: baseapp.getCounters()});
});

socket.on('deploySocketRequest', function(reqAndCounters){
    console.log("deploySocketRequest: executing as Client");
    var counters = reqAndCounters.counters;
    baseapp.setCounters(counters);

    var req = reqAndCounters.req;
    console.log(req);

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


    socket.emit('joinRoom', 123);

});