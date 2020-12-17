$(document).ready(function () {

    $("#button-create").on('click', function () {

        $.get("/api/getNewRoomId", function(data){
            joinRoom(data.roomId);
        });

    });

    // https://stackoverflow.com/a/5917358
    $("#roomid").bind("input propertychange", function () {

        $("#roomid").removeClass(["notTaken", "taken"]);
        $("#button-join").addClass("blocked");

        window.clearTimeout($(this).data("timeout"));
        $(this).data("timeout", setTimeout(function (e) {

            var roomId = $("#roomid").val();

            $.get("/api/isRoomTaken/" + roomId, function(data){
                $("#roomid").removeClass(["notTaken", "taken"]);
                if(data.isTaken == true) {
                    $("#roomid").addClass("taken");
                    $("#button-join").removeClass("blocked");
                } else {
                    $("#roomid").addClass("notTaken");
                }
            });

        }, 1000));

    });

    $("#button-join").bind("click", function () {
        if(!$(this).hasClass("blocked")){
            joinRoom($("#roomid").val());
        }
    });

});

function joinRoom(id) {

    $("#button-create, #button-join").css({"pointer-events": "none"});
    $(".background, .wrapper").animate({"opacity": "0"}, 250, function () {
        window.location.href = "room/" + id;
    });

}