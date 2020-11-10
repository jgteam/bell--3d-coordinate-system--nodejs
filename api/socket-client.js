window.createSocketRequest = createSocketRequest;
function createSocketRequest(req) {
    console.log(req);
}


$(document).ready(function() {
    baseapp.setClientIsHostingRoom(false);
    baseapp.createPoint(true,"blue", 1, 1, 1);
    baseapp.createPoint(false,"red", 1, 2, 2);
});