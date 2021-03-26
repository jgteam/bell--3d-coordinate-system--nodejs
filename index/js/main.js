$(document).ready(function () {

    // Create-Button Eventlistener: Wird beim Drücken ausgeführt
    $("#button-create").on('click', function () {

        // Über die API freie roomID bekommen, und den Raum mit der ID dann anschließend beitreten
        $.get("/api/getNewRoomId", function(data){
            joinRoom(data.roomId); // Raum beitreten
        });

    });

    // https://stackoverflow.com/a/5917358
    // Wird aufgerufen, wenn sich das INPUT-Element für den Raumbeitritt ändert und überprüft die eingegebene Raumnummer, bevor man beitreten kann.
    $("#roomid").bind("input propertychange", function () {

        // Vor der Überprüfung...

        // Entfernt die CSS-Klassen, welche anzeigen, ob der Raum beitretbar ist, oder nicht
        $("#roomid").removeClass(["notTaken", "taken"]);
        // Deaktiviert den Beitreten-Button
        $("#button-join").addClass("blocked");

        // Timeout, welcher nachdem sich eine Sekunde am stück der Inhalt des INPUTS-Element nicht geändert hat, ausgeführt wird
        window.clearTimeout($(this).data("timeout"));
        $(this).data("timeout", setTimeout(function (e) {

            // INPUT-Element auslesen
            var roomId = $("#roomid").val();

            // RoomID über die API überprüfen
            $.get("/api/isRoomTaken/" + roomId, function(data){
                $("#roomid").removeClass(["notTaken", "taken"]);
                if(data.isTaken == true) { // Wenn der Raum belegt ist, und somit beitretbar ist
                    $("#roomid").addClass("taken");
                    $("#button-join").removeClass("blocked");
                } else { // Wenn der Raum nicht belegt ist, und somit nicht beitretbar ist
                    $("#roomid").addClass("notTaken");
                }
            });

        }, 1000));

    });

    // Join-Button Eventlistener: Wird beim Drücken ausgeführt
    $("#button-join").bind("click", function () {
        if(!$(this).hasClass("blocked")){ // Wenn er nicht deaktiviert ist...
            joinRoom($("#roomid").val()); // Raum mit der eingegebenen Nummer beitreten
        }
    });

});

// joinRoom-Funktion, welche den Nutzer zum Raum weiterleitet
function joinRoom(id) {

    $("#button-create, #button-join").css({"pointer-events": "none"}); // Weitere Interaktionen mit den Buttons verhindern
    $(".background, .wrapper").animate({"opacity": "0"}, 250, function () { // Fade-Animation spielen
        window.location.href = "room/" + id; // Nach dem Beenden der Animation zum Raum weiterleiten
    });

}