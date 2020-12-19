// Javascript-Code ist von dem Beispielprojekt von Three.JS namens "css3d - orthographic" inspiriert.
//
// !! Einige Codeblöcke sind direkt von dem Beispiel übernommen worden !!
//
//      Demo: https://threejs.org/examples/css3d_orthographic.html
//      Code: https://github.com/mrdoob/three.js/blob/master/examples/css3d_orthographic.html

// Benutze Dokumentationen für Three.JS:
// https://threejs.org/docs/
// https://threejs.org/docs/#examples/en/controls/OrbitControls

// Info: Mit Kameraschwenkungen, -position, -rotation, etc ist das selbe gemeint.


// Three.JS-Module importieren
import * as THREE from '../vendors/threejs/three.module.js';

// OrbitControls importieren - Kümmert sich um die Steuerung der Kamera
import { OrbitControls } from '../vendors/threejs/OrbitControls.js';

// CSS3DRenderer und CSS3DObjects importieren - Ermöglicht es einen Renderer zu erstellen,
// welcher DOM-Elemente als Objekte nutzen kann
import { CSS3DRenderer, CSS3DObject } from '../vendors/threejs/CSS3DRenderer.js';


// Variablen deklarieren (und initialisieren)

// Benötigte Variablen für die 3D-Darstellung
var camera, scene, scene_webGL, renderer, renderer_webGL, controls;
// Info: die WebGL-Szene und -Renderer werden nur für die Darstellung der Ebenen,
// welche man in das Koordinatensystem selbst in der Webapp einfügen kann, genutzt.


// Größe des Kegelstumpfes, welcher das Sichtvolumen des Betrachters (hier die Kamera) bestimmt,
// vom Three.JS Beispielprojekt übernommen
// Def.: https://de.wikipedia.org/wiki/Frustum
var frustumSize = 500;

// Größe einer Längeneinheit in Pixel
var unitSize = 15;

// Größe des Koordinatensystems (Komplette Höhe, breite und Tiefe) in Pixel
var gridSize = 300;

// Feld, welches alle CSS3D-Objekte beinhaltet, die immer zur Kamera gerichtet werden sollen
var cameraFacingCSS3DObjects = [];

// Nutzer-Modi
// Bestimmt wie mit dem Koordinatensystem und den Objekten interagiert werden kann

// Feld, welches alle möglichen Nutzer-Modi beinhaltet
var rendererUserModes = [
    "move",                 // freier Bewegungsmodus (standard)
    "selectPoint",          // Auswahlmodus für Punkte
    "selectPointConnection" // Auswahlmodus für Strecken
];
// Aktueller Nutzermodus
var rendererUserMode = "move";

// Aktions-Modi

// Feld, welches alle möglichen Aktions-Modi beinhaltet
var rendererActionModes = [
    /* "", */                  // "leerer/kein Aktions-Modus"
    "createPoint",          // Modus: neuen Punkt erstellen
    "createPointConnection",// Modus: neue Strecke erstellen
    "createPlane",          // Modus: neue Ebene erstellen
    "selectCameraTarget"    // Modus: Punkt wählen für einen neuen Kamerafokus
];
// Aktueller Aktions-Modus
var rendererActionMode = "";

// Zähler für die Benennung von neuen Objekten
var pointCounter = 1;
var pointConnectionCounter = 1;
var planeCounter = 1;

// Zähler für den Host (zählt bei jedem "updateBroadcastCounter" hoch)
var broadcastedPointCounter = 0;
var broadcastedPointConnectionCounter = 0;
var broadcastedPlaneCounter = 0;

// Aktuelle Rotation des Koordinatensystem/Kameraposition
// 0 = freie Rotation
// 1 = XYZ-Achse (= welche beim Seitenaufruf in Verwendung ist)
// 2 = XZ-Achse
// 3 = YZ-Achse
// 4 = XY-Achse
var rotationPosition = 1;

// Legt die Farbauswahl für die Objekte im Koordinatensystem fest
var domColors = [
    /*"black",
    "red",
    "orange",
    "coral",
    "aqua",
    "blue",
    "purple",
    "green",
    "deeppink",
    "lime",*/
    "Black",
    "Crimson",
    "Red",
    "FireBrick",
    "DarkRed",
    "DeepPink",
    "MediumVioletRed",
    "Coral",
    "Tomato",
    "OrangeRed",
    "DarkOrange",
    "Orange",
    "Gold",
    "Yellow",
    "Indigo",
    "MediumSlateBlue",
    "SlateBlue",
    "DarkSlateBlue",
    "GreenYellow",
    "Chartreuse",
    "LawnGreen",
    "Lime",
    "LimeGreen",
    "MediumSeaGreen",
    "SeaGreen",
    "ForestGreen",
    "Green",
    "DarkGreen",
    "YellowGreen",
    "OliveDrab",
    "Olive",
    "DarkOliveGreen",
    "MediumAquamarine",
    "DarkSeaGreen",
    "LightSeaGreen",
    "DarkCyan",
    "Teal",
    "CadetBlue",
    "SteelBlue",
    "LightSteelBlue",
    "DodgerBlue",
    "CornflowerBlue",
    "RoyalBlue",
    "Blue",
    "MediumBlue",
    "DarkBlue",
    "Navy",
    "MidnightBlue",
    "BurlyWood",
    "Tan",
    "RosyBrown",
    "SandyBrown",
    "Goldenrod",
    "DarkGoldenrod",
    "Peru",
    "Chocolate",
    "SaddleBrown",
    "Sienna",
    "Brown",
    "Maroon",
    "Silver",
    "DarkGray",
    "Gray",
    "DimGray",
    "LightSlateGray",
    "SlateGray",
    "DarkSlateGray",
    "Black",
];

// Felder für die spätere Speicherung von CSS3D-Objekten, welche das Koordinatensystem an sich aufbauen
//
// Diese werden später benutzt, um die Koordinatensystemgröße später noch anpassen zu können
var css3dObjects_planes = [];
var css3dObjects_axels = [];
var css3dObjects_axelEnds = [];

// Maximale X, Y oder Z Koordinate eines Objektes -- Negative Werte werden als positive gewertet (maxXYZValue >= 0)
var maxXYZValue = 0;

// Aktuelle "Customname"-Größe der Punkte
var customnameSize = "normal"; // normal, smaller, hidden
var customnameSizes = [
    "normal",
    "smaller",
    "hidden"
];

var clientIsHostingRoom = true;
var roomId = null;

var currentMousePos = { x: "0vh", y: "0vh" };

// Initialisation
init();
// Animation starten
animate();




// ### TEST BEGIN ###
// kann ignoriert werden!

//sandbox();
function sandbox() {

    /*

        createPoint("red",3, 4, 1);

        createPoint("red",1, 3, 4);

        createPoint("blue",1, 6, 0);

        createPlane(false,"red",
            coordinatesToTHREEVector3(3, 4, 1),
            coordinatesToTHREEVector3(1, 3, 4),
            coordinatesToTHREEVector3(1, 6, 0)
        );

        createPointConnection(false,"pink",
            coordinatesToTHREEVector3(3, 4, 1),
            coordinatesToTHREEVector3(10, 30, 40)
        );

        createPoint("blue",1, 6, 40.5);
    */



    //createPoint("black",-10, -10, 10);
    /*
        createPoint("red",1, 3, 0);

        createPoint("red",1, 3, 4);

        createPoint("blue",1, 6, 0);

        createPoint("blue",1, 6, 4);

        createPoint("orange",5, 6, 0);

        createPoint("orange",5, 6, 4);

        createPoint("purple",5, 3, 0);
        createPoint("purple",5, 3, 4);

        createPoint("green",3, 4.5, 6);*/

    /*createPointConnection("green", "connection_xy1", coordinatesToTHREEVector3(1, 3, 0), coordinatesToTHREEVector3(5, 6, 4));

    createPointConnection("red", "connection_xy2",
        coordinatesToTHREEVector3(1, 3, 0),
        coordinatesToTHREEVector3(1, 3, 4)
    );

    createPointConnection("black", "connection_xy3",
        coordinatesToTHREEVector3(-10, -10, -10),
        coordinatesToTHREEVector3(10, 10, 10)
    );*/


    /*for(var a = -3; a <= 3; a++){
        for(var b = -3; b <= 3; b++){
            for(var c = -3; c <= 3;c++){

                var d = 0.5;
                createPoint("darkblue",a*d, b*d, c*d);

            }
        }
    }*/


}

function logtest() {
    console.log(camera);
    console.log(camera.position);
    //controls.reset();
}
//window.logtest = logtest;

// ### TEST END ###






// Initialisationsfunktion
function init() {

    // Seitenverhältnis berechnen
    var aspect = window.innerWidth / window.innerHeight;

    // Neue Szene erstellen
    scene = new THREE.Scene();

    scene_webGL = new THREE.Scene();
    scene_webGL.background = new THREE.Color(0xffffff );

    // Neue Kamera erstellen
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / - 2,
        1,
        1000
    );

    // Neuer CSS3DRenderer
    renderer = new CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;

    // Neuer WebGLRenderer
    renderer_webGL = new THREE.WebGLRenderer({ alpha: true });
    renderer_webGL.setClearAlpha( 0 );
    renderer_webGL.setPixelRatio( window.devicePixelRatio );
    renderer_webGL.setSize( window.innerWidth, window.innerHeight );

    // Renderer dem Body hinzufügen
    document.body.appendChild( renderer.domElement );
    document.body.appendChild( renderer_webGL.domElement );
    // ID dem Renderer zuordnen
    $(renderer.domElement).attr("id","renderer");
    $(renderer_webGL.domElement).attr("id","renderer_webGL");

    // Standard User- und Acionmode setzen
    setRendererUserMode(rendererUserMode);
    setRendererActionMode(rendererActionMode);

    // Kamera ausrichten
    camera.position.set( 150, 150, 150 );

    // Kontrolllogik für das Bedienen
    controls = new OrbitControls( camera, renderer.domElement );

    // Zoomlimits setzen
    controls.minZoom = 0.25;
    controls.maxZoom = 15;

    // "Kameraschwenkungen", hier Verschiebungen, deaktivieren
    // Kann u. a. Renderprobleme beheben
    //controls.enablePan = false;


    // Generiert alle CSS3D-Elemente für das Koordinatensystem an sich
    createCoordinateSystem();
    function createCoordinateSystem(){

        // Im Folgenden werden sich Codeabschnitte wiederholen, weshalb nur das erste Vorkommen kommentiert wurde


        // Zuerst werden die "Gitter-Planen" und die dazugehörigen Achsen generiert

        /*
            Eine Achse (auch die später vorkommenden Strecken) besteht aus zwei Elementen (zwei lange Rechtecke).
            Weil die Rechtecke jeweils 0px dick bzw. 2D sind, und in bestimmten Blickwinkeln nicht sichtbar sind,
            bilden die zwei Rechtecke ein "Kreuz". Das bildet die Illusion,
            dass es sich bei der Achse um einen Zylinder handelt.
        */


        // In der ganzen Funktion werden die CSS3D-Objekte erstellt
        // und in die dazugehörigen Arrays "gepusht" (hinzugefügt) -- siehe Kommentar/Code Zeilen 95-100

        // XY

        // XY-Gitter
        css3dObjects_planes.push(createCSS3DElement( // Erstellt ein neues CSS3D-Element
            { // Setzt individuelle CSS-Attribute
                "width": gridSize + "px",
                "height": gridSize + "px",
                "opacity": 0.7,
                "background-color": "rgba(0, 0, 0, 0.025)"
            },
            "",
            "xy-plane", // Setzt individuelle HTML-klasse
            new THREE.Vector3( 0, 0, 0 ), // Beschreibt die Position (=Element-Mitte) des Elements
            new THREE.Euler( - 90 * THREE.MathUtils.DEG2RAD, 0, 0 ), // Bestimmt die Rotation des Elementes
            false // Bestimmt ob das Element sich immer zur Kamera drehen soll (Falls "true", wäre die gesetzte Rotation irrelevant)
        ));

        // X-Achse auf dem XY-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "xy-plane-x-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( - 90 * THREE.MathUtils.DEG2RAD, 0, 90 * THREE.MathUtils.DEG2RAD ),
            false
        ));

        // Y-Achse auf dem XY-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "xy-plane-y-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( - 90 * THREE.MathUtils.DEG2RAD, 0, 0 ),
            false
        ));

        // XZ

        // XZ-Gitter
        css3dObjects_planes.push(createCSS3DElement(
            {
                "width": gridSize + "px",
                "height": gridSize + "px",
                "opacity": 0.05,
                "background-color": "rgba(0, 0, 0, 0.02)"
            },
            "",
            "xz-plane",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, - 90 * THREE.MathUtils.DEG2RAD, 0 ),
            false
        ));

        // Y-Achse auf dem XZ-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "xz-plane-x-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, - 90 * THREE.MathUtils.DEG2RAD, 0 ),
            false
        ));

        // Z-Achse auf dem XZ-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "xz-plane-z-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, - 90 * THREE.MathUtils.DEG2RAD, 90 * THREE.MathUtils.DEG2RAD ),
            false
        ));

        // YZ

        // YZ-Gitter
        css3dObjects_planes.push(createCSS3DElement(
            {
                "width": gridSize + "px",
                "height": gridSize + "px",
                "opacity": 0.05,
                "background-color": "rgba(0, 0, 0, 0.02)"
            },
            "",
            "yz-plane",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, 0, 0 ),
            false
        ));

        // Y-Achse auf dem YZ-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "yz-plane-y-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, 0, 0 ),
            false
        ));

        // Z-Achse auf dem YZ-Gitter
        css3dObjects_axels.push(createCSS3DElement(
            {
                "width": gridSize + "px"
            },
            "",
            "yz-plane-z-axle",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, 0, 90 * THREE.MathUtils.DEG2RAD ),
            false
        ));


        // Jetzt werden die Pfeile an den Achsen-Enden, sowie die Achsenbeschriftung, generiert

        // X-Achse
        // Pfeil
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "",
            "x-axle-end",
            new THREE.Vector3( 0, 0, gridSize / 2 ),
            new THREE.Euler( - 90 * THREE.MathUtils.DEG2RAD, 0,  90 * THREE.MathUtils.DEG2RAD ),
            false
        ));
        // Beschriftung
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "x", // Setzt die Beschriftung
            "x-axle-end-text axle-end-text",
            new THREE.Vector3( 0, 0, gridSize / 2 + 20 ),
            new THREE.Euler(0, 0, 0),
            true // Beschriftung wird immer zur Kamera gerichtet sein
        ));

        // Y-Achse
        // Pfeil
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "",
            "y-axle-end",
            new THREE.Vector3( gridSize / 2, 0, 0 ),
            new THREE.Euler( - 90 * THREE.MathUtils.DEG2RAD, 0, 180 * THREE.MathUtils.DEG2RAD ),
            false
        ));
        // Beschriftung
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "y",
            "y-axle-end-text axle-end-text",
            new THREE.Vector3( gridSize / 2 + 20, 0, 0 ),
            new THREE.Euler(0, 0, 0),
            true
        ));

        // Z-Achse
        // Pfeil
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "",
            "z-axle-end",
            new THREE.Vector3( 0, gridSize / 2, 0 ),
            new THREE.Euler( 0, 0, - 90 * THREE.MathUtils.DEG2RAD ),
            false
        ));
        // 2ter Pfeil (90° gedreht) für bessere Sichtbarkeit (vgl. Achse und Strecke)
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "",
            "z-axle-end-2nd-perspective",
            new THREE.Vector3( 0, gridSize / 2, 0 ),
            new THREE.Euler( 0, 90 * THREE.MathUtils.DEG2RAD, - 90 * THREE.MathUtils.DEG2RAD ),
            false
        ));
        // Beschriftung
        css3dObjects_axelEnds.push(createCSS3DElement(
            {},
            "z",
            "z-axle-end-text axle-end-text",
            new THREE.Vector3( 0, gridSize / 2 + 20, 0 ),
            new THREE.Euler(0, 0, 0),
            true
        ));


        // Ursprungselement für spätere Berechnungen:
        createCSS3DElement(
            {
                "width": "0px",
                "height": "0px",
                "opacity": 0,
                "background-color": "rgba(0, 0, 0, 0)"
            },
            "",
            "coordinateSystem-center",
            new THREE.Vector3( 0, 0, 0 ),
            new THREE.Euler( 0, 0, 0 ),
            false
        )

    }

    // Eventlisteners setzen

    // Funktion "onControlsChange" dem Event "change" anbinden.
    // Wird aufgerufen, falls mit dem Koordinatensystem interagiert wird.
    controls.addEventListener( 'change', onControlsChange, false );

    // Funktion, welche aufgerufen wird, falls sich die Fenstergröße ändern sollte
    window.addEventListener( 'resize', onWindowResize, false );

    // Alle Eventlistener (für die GUI-Buttons)

    $("#toolbox button#button-createPoint").on("click", buttonCreatePoint);
    $("#toolbox button#button-createPointConnection").on("click", buttonCreatePointConnection);
    $("#toolbox button#button-createPlane").on("click", buttonCreatePlane);

    $("#toolbox button.button-mode").on("click", function () {
        setRendererUserMode($(this).attr("mode")); // Setzt den "UserMode" je nach Button, welcher die Funktion aufruft.
    });

    $("#toolbox button#button-toggleCustomnameSize").on("click", buttonToggleCustomnameSize);

    $("#toolbox button#button-resetCamera").on("click", buttonResetRotation);

    $("#toolbox button#button-selectCameraTarget").on("click", buttonSelectCameraTarget);
    $("#toolbox button#button-resetCameraTarget").on("click", buttonResetCameraTarget);

    $("#toolbox #createpoint-dialogbox #button-submitCreatePointDialogBox").on("click", buttonSubmitCreatePoint);

    $("#objectbox #button-toggleObjectBoxSize").on("click", buttonToggleObjectBoxSize);

    $("#toolbox #button-mirror").on("click", toggleMirroring);

    $("#notifications").on("mouseleave", function (){$(this).scrollTop(0)});

    // Eventlistener für die Tooltips

    // Zeigt den Tooltip bei einem Hover- oder Mouseover-Event,
    // welche bei einem GUI-Button mit "tooltip"-Attribut ausgelöst wurden
    $(".gui-button[tooltip]").on("hover mouseover", showButtonTooltip);

    // Versteckt den Tooltip, wenn der Cursor den GUI-Button verlässt
    $(".gui-button[tooltip]").on("mouseout", hideButtonTooltip);

    // Füllt das Select-Element, für die Punkterstellung in der "Createpoint-Dialogbox", mit den oben bestimmten Farben.
    domColors.forEach(function (color){
        $("#toolbox #color").append(
            "<option style='color: white; background-color: " + color + ";'>" + color + "</option>"
        );
    })

    // Eventlistener für Import, Export und DeleteAll

    $("#import").on("change", importFile);
    $("#download").on("click", downloadExportBlob);
    $("#button-deleteAll").on("click", deleteAll);

    // https://stackoverflow.com/a/4517215
    $(document).mousemove(function(event) {

        var pageHeight = $(window).height();
        var pageWidth = $(window).width();

        currentMousePos.x = ((event.pageX - pageWidth / 2) / pageHeight * 100) + "vh";
        currentMousePos.y = ((event.pageY - pageHeight / 2) / pageHeight * 100) + "vh";

    });

}

// Startet die Animation
function animate() {

    // Animation starten
    requestAnimationFrame( animate );

    // Kamera und Szene dem Renderer übergeben
    renderer.render( scene, camera );
    renderer_webGL.render( scene_webGL, camera );

}

// ### Diverse Eventlistener-Funktionen

// Funktion wird aufgerufen wenn der User das Koordinatensystem rotiert
function onControlsChange() {

    updateCameraFacingObjects();

    /*
        Rotations-Position wird durch Userinput auf "frei" (= 0; siehe oben) gesetzt,
        falls die Rotation nicht durch den "ResetCamera"-Button ausgelöst wurde
    */
    if($("#toolbox button#button-resetCamera:focus").length < 1)
        rotationPosition = 0;

    calculateAdditionalAxles();

}


function calculateAdditionalAxles() {

    calculateAdditionalAxle("x");
    calculateAdditionalAxle("y");
    calculateAdditionalAxle("z");

}

function calculateAdditionalAxle(axleLetter) {

    var axle = $("." + axleLetter + "-axle-end-text");
    var additionalAxle = $("#additional-axle-ends .additional-axle-ends." + axleLetter);

    var toolboxHeight = $("#toolbox").outerHeight() + 30;

    var additionalAxleEndDimension = additionalAxle.outerWidth();
    var screenWidth = $(window).width() - additionalAxleEndDimension;
    var screenHeight = $(window).height() - additionalAxleEndDimension - toolboxHeight;

    var positionCoordinateSystemCenter = $(".coordinateSystem-center").offset();
    var positionAxleEnd = axle.offset();

    positionAxleEnd.top += axle.outerHeight() / 2;
    positionAxleEnd.left += axle.outerWidth() / 2;

    var overTopBorder = positionAxleEnd.top < 0;
    var belowBottomBorder = positionAxleEnd.top > screenHeight;
    var besidesLeftBorder = positionAxleEnd.left < 0;
    var besidesRightBorder = positionAxleEnd.left > screenWidth;

    var axleOnCorner = ((besidesLeftBorder || besidesRightBorder) && (overTopBorder || belowBottomBorder));

    var isAxleOnScreen = !((besidesLeftBorder || besidesRightBorder) || (overTopBorder || belowBottomBorder));
    var isCoordinateSystemCenterOnScreen = (
        positionCoordinateSystemCenter.top >= 0
        && positionCoordinateSystemCenter.top <= screenHeight
        && positionCoordinateSystemCenter.left >= 0
        && positionCoordinateSystemCenter.left <= screenWidth
    );

    //check if coordinateSystem_center is onscreen
    if (isCoordinateSystemCenterOnScreen && !isAxleOnScreen) {

        additionalAxle.not(".visible").addClass("visible");

        if (besidesLeftBorder || besidesRightBorder) {

            // f(x) = ax+b
            var steigung = ((positionCoordinateSystemCenter.top - positionAxleEnd.top) / (positionCoordinateSystemCenter.left - positionAxleEnd.left));
            var achsenabschnitt = (positionCoordinateSystemCenter.top - (positionCoordinateSystemCenter.left * steigung));


            if(besidesRightBorder)
                achsenabschnitt = steigung * screenWidth + achsenabschnitt;

            if (achsenabschnitt < 0)
                achsenabschnitt = 0;

            if (achsenabschnitt > screenHeight)
                achsenabschnitt = screenHeight;

            additionalAxle.css({
                // f(0)
                "top": achsenabschnitt + "px"
            });

            if(!axleOnCorner && besidesLeftBorder)
                additionalAxle.css({"left": "0px"});
            if(!axleOnCorner && besidesRightBorder)
                additionalAxle.css({"left": screenWidth + "px"});

        }

        if (overTopBorder || belowBottomBorder) {

            // f(x) = ax+b
            var steigung = ((positionCoordinateSystemCenter.left - positionAxleEnd.left) / (positionCoordinateSystemCenter.top - positionAxleEnd.top));
            var achsenabschnitt = (positionCoordinateSystemCenter.left - (positionCoordinateSystemCenter.top * steigung));


            if(belowBottomBorder)
                achsenabschnitt = steigung * screenHeight + achsenabschnitt;

            if (achsenabschnitt < 0)
                achsenabschnitt = 0;

            if (achsenabschnitt > screenWidth)
                achsenabschnitt = screenWidth;

            additionalAxle.css({
                // f(0)
                "left": achsenabschnitt + "px"
            });

            if(!axleOnCorner && overTopBorder)
                additionalAxle.css({"top": "0px"});
            if(!axleOnCorner && belowBottomBorder)
                additionalAxle.css({"top": screenHeight + "px"});

        }


    } else {

        additionalAxle.removeClass("visible");

    }

}


// Funktion wird ausgeführt, wenn die Fenstergröße geändert wird und wurde aus dem Beispielprojekt übernommen
function onWindowResize() {

    // Seitenverhältnis neu berechnen
    var aspect = window.innerWidth / window.innerHeight;

    // Wände des Kegelstumpfes für die Kamera neu zuordnen
    camera.left = - frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = - frustumSize / 2;
    camera.updateProjectionMatrix();

    // Größe des Renderers neu setzen
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer_webGL.setSize( window.innerWidth, window.innerHeight );

}

// Wird mit "onControlsChange()" und mit "createCSS3DElement()" ausgeführt,
// damit immer alle "camerafacing" Objekte korrekt ausgerichtet sind
function updateCameraFacingObjects() {

    // Foreach-Schleife, welche alle "camerafacing" CSS3D-Objekte durchläuft
    cameraFacingCSS3DObjects.forEach(function (object) {
        // Setzt für das aktuelle Objekt die Rotation mit der Kamera-Rotation gleich
        object.rotation.copy(new THREE.Euler(camera.rotation.x , camera.rotation.y , camera.rotation.z));
    });

}

function showButtonTooltip() {

    $("#toolbox #button-tooltip.tooltip")
        .text($(this).attr("tooltip")) // Setzt Tooltip-Text über HTML-Attribut
        .addClass("active"); // Fügt HTML/CSS-Klasse "active" hinzu, damit der Text besser sichtbar* wird (*CSS)

}

function hideButtonTooltip() {

    $("#toolbox #button-tooltip.tooltip")
        .text("Aktuell: " + $("#toolbox button[mode='" + rendererUserMode + "']").attr("tooltip")) // Setzt Tooltip auf aktuell ausgewählten UserMode
        .removeClass("active"); // Entfernt die HTML/CSS-Klasse, damit der Text wieder weniger sichtbar wird

}

// ### "Hilfs"-Funktionen

// Übersetzt "normale Koordinaten" (welche der Nutzer in der Webapp benutzt) in THREE Vector3-Koordinaten
function coordinatesToTHREEVector3(x, y, z) {

    return new THREE.Vector3( y * unitSize, z * unitSize, x * unitSize);

}

// Übersetzt THREE Vector3-Koordinaten in "normale Koordinaten" und gibt diese als JS-Objekt aus
function THREEVector3ToCoordinates(x, y, z) {

    return {
        x: z / unitSize,
        y: x / unitSize,
        z: y / unitSize
    }

}

function setRendererUserMode(mode) {

    // Setzt neuen UserMode
    rendererUserMode = mode;

    // Hebt die Auswahl auf
    $("#renderer > div > .selected, #objectbox > div > .selected").removeClass("selected");

    // Setzt Objekt-Tooltip auf "nichts ausgewählt", da die Auswahl oben aufgehoben wurde
    $("#toolbox #object-tooltip.tooltip").html("<i>nichts ausgewählt</i>").removeClass("active");

    // Setzt HTML/CSS-Klasse, den aktuellen UserMode, für den Renderer und Toolbox.
    // Dabei werden alle vorherigen Action- und UserModes entfernt.
    $("#renderer, #renderer_webGL, #toolbox").removeClass(rendererUserModes).addClass(mode).removeClass(rendererActionModes);

    // Methode aktualisiert den angezeigten Auswahlmodus im Tooltip/in der Toolbox, da er sich geändert hat
    hideButtonTooltip();

}

function setRendererActionMode(mode) {

    // Setzt neuen ActionMode
    rendererActionMode = mode;

    // Setzt HTML/CSS-Klasse, den aktuellen ActionMode, für den Renderer und Toolbox.
    // Dabei werden alle vorherigen ActionModes entfernt.
    $("#renderer, #renderer_webGL, #toolbox").removeClass(rendererActionModes).addClass(mode);

}

window.setNewMaxXYZValue = setNewMaxXYZValue;

function setNewMaxXYZValue(newValue) {

    // Setzt neuen Wert für die Variable "maxXYZValue" und passt die Koordinatengröße an

    maxXYZValue = Math.ceil(Math.abs(newValue));
    setGridSize(maxXYZValue);

}

function getNewMaxXYZValue() {

    // Ermittelt den Maximalwert für "maxXYZValue" indem alle Objekte im Koordinatensystem durchgegangen werden.

    maxXYZValue = 0;

    // Foreach-Schleife geht alle Objekte durch
    $("#renderer > div > .object").each(function () {

        if($(this).hasClass("point")){ // Falls es sich um einen Punkt handelt

            // Vergleicht alle einzelnen Koordinaten mir der aktuellen maxXYZValue
            // Falls die Koordinate größer ist, wird die maxXYZValue überschrieben
            if(maxXYZValue < Math.abs($(this).attr("x")))
                maxXYZValue = Math.abs($(this).attr("x"));
            if(maxXYZValue < Math.abs($(this).attr("y")))
                maxXYZValue = Math.abs($(this).attr("y"));
            if(maxXYZValue < Math.abs($(this).attr("z")))
                maxXYZValue = Math.abs($(this).attr("z"));

        }else if($(this).hasClass("pointConnection")){ // Falls es sich um eine Strecke handelt

            // Vergleicht alle einzelnen Koordinaten mir der aktuellen maxXYZValue
            // Falls die Koordinate größer ist, wird die maxXYZValue überschrieben
            if(maxXYZValue < Math.abs($(this).attr("start_x")))
                maxXYZValue = Math.abs($(this).attr("start_x"));
            if(maxXYZValue < Math.abs($(this).attr("start_y")))
                maxXYZValue = Math.abs($(this).attr("start_y"));
            if(maxXYZValue < Math.abs($(this).attr("start_z")))
                maxXYZValue = Math.abs($(this).attr("start_z"));
            if(maxXYZValue < Math.abs($(this).attr("end_x")))
                maxXYZValue = Math.abs($(this).attr("end_x"));
            if(maxXYZValue < Math.abs($(this).attr("end_y")))
                maxXYZValue = Math.abs($(this).attr("end_y"));
            if(maxXYZValue < Math.abs($(this).attr("end_z")))
                maxXYZValue = Math.abs($(this).attr("end_z"));

        }

        // Ebenen werden nicht bei dieser Berechnung überprüft (bis jetzt...)

    });

    // Passt die Koordinatengröße an
    setNewMaxXYZValue(maxXYZValue);

}

// Verändert die Größe des Koordinatensystems
function setGridSize(newGridSize) {

    newGridSize = Math.abs(newGridSize);

    // Koordinatengröße muss mindestens 10 Einheiten betragen
    if(newGridSize < 10)
        newGridSize = 10;

    // Überschreibt gridSize mit neuem Wert
    gridSize = (newGridSize * 2 /*da das Koordinatensystem gleichweit in den positiven und negativen Bereich geht*/) * unitSize /*Mit der Längeneinheit multipliziert, da die variable gridSize in Pixel ist*/;


    // Passt die Koordinaten-"Gitter" an
    css3dObjects_planes.forEach(function (css3dObject) {

        // Setzt die CSS Regel neu
        $(css3dObject.element).css({"width": gridSize + "px", "height": gridSize + "px"});

    });

    // Passt die Koordinaten-Achsen an
    css3dObjects_axels.forEach(function (css3dObject) {

        // Setzt die CSS Regel neu
        $(css3dObject.element).css({"width": gridSize + "px"});

    });

    // Passt die Koordinaten-Achsenenden an
    css3dObjects_axelEnds.forEach(function (css3dObject) {

        if($(css3dObject.element).hasClass("axle-end-text")) { // Passt die Beschriftung an

            // Text ("x", "y" oder "z") bestimmt die Ausrichtung, welche für die Anpassung/Verschiebung relevant ist
            var direction = $(css3dObject.element).text();

            // Je nach Ausrichtung wird die Position des Textes neu gesetzt
            switch (direction){
                case "x":
                    css3dObject.position.copy(new THREE.Vector3( 0, 0, gridSize / 2 + 20 ));
                    break;
                case "y":
                    css3dObject.position.copy(new THREE.Vector3( gridSize / 2 + 20 , 0, 0));
                    break;
                case "z":
                    css3dObject.position.copy(new THREE.Vector3( 0, gridSize / 2 + 20 , 0 ));
                    break;
            }

        } else { // Passt die Pfeile an

            // HTML-Klasse bestimmt die Ausrichtung, welche für die Anpassung/Verschiebung relevant ist
            var domClass = $(css3dObject.element).attr("class");

            // Je nach Klasse wird die Position des Pfeiles neu gesetzt
            switch (domClass){
                case "x-axle-end":
                    css3dObject.position.copy(new THREE.Vector3( 0, 0, gridSize / 2 ));
                    break;
                case "y-axle-end":
                    css3dObject.position.copy(new THREE.Vector3( gridSize / 2 , 0, 0));
                    break;
                case "z-axle-end":
                    css3dObject.position.copy(new THREE.Vector3( 0, gridSize / 2 , 0 ));
                    break;
                case "z-axle-end-2nd-perspective":
                    css3dObject.position.copy(new THREE.Vector3( 0, gridSize / 2 , 0 ));
                    break;
            }

        }

    });

}

// ### Funktionen für die Erstellung von Objekten

// Funktion erstellt ein neues CSS3D-Element, welches zu der Szene hinzugefügt wird
function createCSS3DElement(
    css,            // CSS-Regel(n) des neuen DOM-(CSS3D-)Elements als JS-Objekt
    text,           // Text (Inhalt) des neuen DOM-(CSS3D-)Elements als String
    domClass,       // DOM-/HTML-klasse(n) des neuen DOM-(CSS3D-)Elements als String oder Array mit Strings
    position,       // Position des neuen DOM-(CSS3D-)Elements als THREE.Vector3
    rotation,       // Rotation des neuen DOM-(CSS3D-)Elements als THREE.Euler
    cameraFacing    // Boolean, ob das neue DOM-(CSS3D-)Element immer zur Kamera ausgerichtet werden soll
) {

    // Erstellt neues DOM-Element (DIV)
    var element = document.createElement( 'div' );

    // Fügt die CSS-Regeln, Klassen und den Text hinzu
    $(element).css(css).addClass(domClass).text(text);

    // Erstellt neues CSS3DObjekt aus DOM-Element
    var object = new CSS3DObject( element );

    // Benennt neues CSS3DObjekt nach der Klasse / den Klassen
    object.name = domClass;

    // Setzt Position und Rotation
    object.position.copy( position );
    object.rotation.copy( rotation );

    // Fügt das Objekt der Szene hinzu
    scene.add( object );

    // Fügt das Objekt dem entsprechenden Array hinzu, falls es mit seiner Rotation der Kamera folgen soll
    if(cameraFacing)
        cameraFacingCSS3DObjects.push(object);

    // Aktualisiert alle zur Kamera ausgerichteten Objekte
    updateCameraFacingObjects();

    // Gibt das CSS3D-Objekt wieder zurück, für mögliche Weiterverarbeitung
    return object;

}

// Erstellt einen Punkt im Koordinatensystem
function createPoint(
    fromsocket, // Parameter bestimmt, ob die Funktion durch eine Socket-Anweisung aufgerufen wurde
    color,  // Farbe als CSS-Color (z. B.: "black", "rgb(0, 0, 0)", "rgba(0, 0, 0, 1)")
    x,      // X-Koordinate
    y,      // Y-Koordinate
    z       // Z-Koordinate
) {

    // Speichert vorübergehen die (Punkt-)Nummerierung und Zähl den dazugehörigen Zähler hoch
    var number = pointCounter++;

    // Erstellt einen eindeutigen Namen
    var name = "point" + number;

    // Erstellt eine eindeutige DOM-Klasse
    var point_element_class = "object-point-" + name;


    if (/*!clientIsHostingRoom && */!fromsocket) {
        pointCounter--;
        createChangeRequest(
            {
                action: "create",
                type: "point",
                properties: {
                    domClass: "object point " + point_element_class,
                    customname: "",
                    color: color,
                    number: number,
                    x: x,
                    y: y,
                    z: z
                }
            }
        );

        return;
    }



    // Erstellt ein neues CSS3D-Element
    var point_element = createCSS3DElement({
            "width": "2px",                             // Breite des Punktes
            "height": "2px",                            // Höhe des Punktes
            "background-color": color,                  // Farbe des Punktes
            "border-radius": "2px"                      // Abrundung des Punktes
        },
        "",                                             // Der Punkt besitzt keinen Inhalt/Text
        "object point " + point_element_class,          // Fügt DOM-Klassen hinzu
        coordinatesToTHREEVector3(x, y, z),             // Wandelt die Koordinaten in einen THREE.Vector3 um und übermittelt diesen
        new THREE.Euler(0, 0, 0),                       // Der Punkt besitzt keine feste Rotation...
        true                                            // ...da er immer zur Kamera ausgerichtet wird
    );

    $(point_element.element)
        // Fügt den Eventlistener hinzu, damit das Element durch anklicken ausgewählt werden kann
        .on("click touchstart touchend", selectObject)
        // Fügt Nummerierung und Koordinaten als Attribute hinzu
        .attr("number", number).attr("x", x).attr("y", y).attr("z", z);

    // Fügt das Element zur "Objektbox" hinzu
    addObjectBoxEntry(point_element_class, name.replace("point", "Punkt Nr."), "point");

    // Prüft ob es sich bei einer Koordinate um die neue "maxXYZValue" handelt,
    // und setzt den neuen Wert als Maximum fall nötig
    if(Math.abs(x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(x));
    if(Math.abs(y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(y));
    if(Math.abs(z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(z));

    return point_element.element;

}


// "fromimport" bestimmt, ob dieses Objekt durch einen Importvorgang erstellt werden soll, was dazu führt,
// dass kein "center-point" erzeugt wird.
function createPointConnection(fromsocket, fromimport, color, position_a, position_b) {

    var number = pointConnectionCounter++;

    var name = "pointConnection" + number;

    var pointConnection_element_class = "object-pointConnection-" + name;

    var length = position_a.distanceTo(position_b);

    var position_a_coordinates = THREEVector3ToCoordinates(position_a.x, position_a.y, position_a.z);
    var position_b_coordinates = THREEVector3ToCoordinates(position_b.x, position_b.y, position_b.z);


    if (/*!clientIsHostingRoom && */!fromsocket) {
        pointConnectionCounter--;
        createChangeRequest(
            {
                action: "create",
                type: "pointConnection",
                properties: {
                    domClass: "object pointConnection " + pointConnection_element_class,
                    customname: "",
                    color: color,
                    number: number,
                    start_x: position_a_coordinates.x,
                    start_y: position_a_coordinates.y,
                    start_z: position_a_coordinates.z,
                    end_x: position_b_coordinates.x,
                    end_y: position_b_coordinates.y,
                    end_z: position_b_coordinates.z
                }
            }
        );

        return;
    }


    // Prüft ob es sich bei einer Koordinate um die neue "maxXYZValue" handelt,
    // und setzt den neuen Wert als Maximum fall nötig
    if(Math.abs(position_a_coordinates.x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.x));
    if(Math.abs(position_a_coordinates.y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.y));
    if(Math.abs(position_a_coordinates.z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.z));

    // Prüft ob es sich bei einer Koordinate um die neue "maxXYZValue" handelt,
    // und setzt den neuen Wert als Maximum fall nötig
    if(Math.abs(position_b_coordinates.x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.x));
    if(Math.abs(position_b_coordinates.y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.y));
    if(Math.abs(position_b_coordinates.z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.z));

    var connection_element = createCSS3DElement(
        {
            "width": length + "px",
            "height": "1px",
            "opacity": 0.4,
            "background-color": color
        },
        "",
        "object pointConnection " + pointConnection_element_class,
        position_a,
        new THREE.Euler( 0, 0, 0 ),
        false
    );

    // https://stackoverflow.com/a/43281625
    connection_element.lookAt(position_b);
    connection_element.rotateY( - Math.PI / 2 );
    connection_element.position.copy(new THREE.Vector3(
        (position_a.x + position_b.x) / 2,
        (position_a.y + position_b.y) / 2,
        (position_a.z + position_b.z) / 2
    ));
    $(connection_element.element).on("click touchstart touchend", selectObject).attr("number", number).attr("start_x", position_a_coordinates.x).attr("start_y", position_a_coordinates.y).attr("start_z", position_a_coordinates.z).attr("end_x", position_b_coordinates.x).attr("end_y", position_b_coordinates.y).attr("end_z", position_b_coordinates.z);

    connection_element = createCSS3DElement(
        {
            "width": length + "px",
            "height": "1px",
            "opacity": 0.4,
            "background-color": color
        },
        "",
        "object pointConnection " + pointConnection_element_class,
        position_a,
        new THREE.Euler( 0, 0, 0 ),
        false
    );


    // https://stackoverflow.com/a/43281625
    connection_element.lookAt(position_b);
    connection_element.rotateY( - Math.PI / 2 );
    connection_element.rotateX( Math.PI / 2 );
    connection_element.position.copy(new THREE.Vector3(
        (position_a.x + position_b.x) / 2,
        (position_a.y + position_b.y) / 2,
        (position_a.z + position_b.z) / 2
    ));
    $(connection_element.element).on("click touchstart touchend", selectObject).attr("number", number).attr("start_x", position_a_coordinates.x).attr("start_y", position_a_coordinates.y).attr("start_z", position_a_coordinates.z).attr("end_x", position_b_coordinates.x).attr("end_y", position_b_coordinates.y).attr("end_z", position_b_coordinates.z)
        .attr("second-perspective", true);

    addObjectBoxEntry(pointConnection_element_class, name.replace("pointConnection", "Strecke Nr."), "pointConnection");

    //center-point:
    /*if(!fromimport && clientIsHostingRoom){
        createPoint(true,
            "grey",
            (position_a_coordinates.x + position_b_coordinates.x) / 2,
            (position_a_coordinates.y + position_b_coordinates.y) / 2,
            (position_a_coordinates.z + position_b_coordinates.z) / 2
        );
    }*/

}


function createPlane(fromsocket, fromimport, color, position_a, position_b, position_c) {

    var plane = new THREE.Geometry();
    plane.vertices = [position_a, position_b, position_c];
    plane.faces = [new THREE.Face3(0, 1,2)];

    var number = planeCounter++;
    var name = "plane" + number;

    var position_a_coordinates = THREEVector3ToCoordinates(position_a.x, position_a.y, position_a.z);
    var position_b_coordinates = THREEVector3ToCoordinates(position_b.x, position_b.y, position_b.z);
    var position_c_coordinates = THREEVector3ToCoordinates(position_c.x, position_c.y, position_c.z);


    if (/*!clientIsHostingRoom && */!fromsocket) {
        planeCounter--;
        createChangeRequest(
            {
                action: "create",
                type: "plane",
                properties: {
                    name: name,
                    color: color,
                    number: number,
                    position_a_x: position_a_coordinates.x,
                    position_a_y: position_a_coordinates.y,
                    position_a_z: position_a_coordinates.z,
                    position_b_x: position_b_coordinates.x,
                    position_b_y: position_b_coordinates.y,
                    position_b_z: position_b_coordinates.z,
                    position_c_x: position_c_coordinates.x,
                    position_c_y: position_c_coordinates.y,
                    position_c_z: position_c_coordinates.z
                }
            }
        );

        return;
    }

    addObjectBoxEntry(name, name.replace("plane", "Ebene Nr. "), "plane");


    //var plane_element_class = "object-plane-" + name;

    var mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide}));
    mesh.name = name;
    mesh._number = number;
    mesh._color = color;
    mesh._position_a = position_a_coordinates;
    mesh._position_b = position_b_coordinates;
    mesh._position_c = position_c_coordinates;
    scene_webGL.add(mesh);

    // Prüft ob es sich bei einer Koordinate um die neue "maxXYZValue" handelt,
    // und setzt den neuen Wert als Maximum fall nötig
    if(Math.abs(position_a_coordinates.x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.x));
    if(Math.abs(position_a_coordinates.y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.y));
    if(Math.abs(position_a_coordinates.z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_a_coordinates.z));

    if(Math.abs(position_b_coordinates.x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.x));
    if(Math.abs(position_b_coordinates.y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.y));
    if(Math.abs(position_b_coordinates.z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_b_coordinates.z));

    if(Math.abs(position_c_coordinates.x) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_c_coordinates.x));
    if(Math.abs(position_c_coordinates.y) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_c_coordinates.y));
    if(Math.abs(position_c_coordinates.z) > maxXYZValue)
        setNewMaxXYZValue(Math.abs(position_c_coordinates.z));



    //"center"-point:
    /*if(!fromimport && clientIsHostingRoom){
        createPoint(
            true,
            "grey",
            (position_a_coordinates.x + position_b_coordinates.x + position_c_coordinates.x) / 3,
            (position_a_coordinates.y + position_b_coordinates.y + position_c_coordinates.y) / 3,
            (position_a_coordinates.z + position_b_coordinates.z + position_c_coordinates.z) / 3
        );
    }*/

}

function addObjectBoxEntry(objectClass, objectName, objectType) {


    var objectBoxEntry_element = document.createElement( 'div' );
    $(objectBoxEntry_element).addClass("object gui-button")
        .attr("linked_object", objectClass)
        .attr("linked_object_type", objectType)
        .text(objectName)
        .on("click touchstart touchend", selectObjectByObjectBox)
        .append("<div class='buttons'><div class='setNameButton'></div><div class='deleteElementButton'></div></div>")
        .find(".setNameButton")
        .on("click", setNameByObjectBox)
        .parent()
        .find(".deleteElementButton")
        .on("click", deleteObject);

    $("#objectbox .wrapper").append(objectBoxEntry_element)

}

// ### Funktionen für Objekt-Auswahl

function selectObject() {


    if($("#renderer").hasClass("createPlane") && $("#renderer").find(".object.point.selected").length == 2){

        var x1 = null;
        var y1 = null;
        var z1 = null;

        var x2 = null;
        var y2 = null;
        var z2 = null;

        var first_two_point = $("#renderer").find(".object.point.selected");

        first_two_point.each(function() {

            if(x1 === null) {
                x1 = $(this).attr("x");
                y1 = $(this).attr("y");
                z1 = $(this).attr("z");
            } else {
                x2 = $(this).attr("x");
                y2 = $(this).attr("y");
                z2 = $(this).attr("z");
            }

        })


        $("#renderer > div > .selected").removeClass("selected");
        $($(this).parent().find(".object." + $(this).attr("class").split(" ").pop())).addClass("selected");

        var second_point = $("#renderer").find(".object.point.selected");

        var x3 = second_point.attr("x");
        var y3 = second_point.attr("y");
        var z3 = second_point.attr("z");

        createPlane(false, false, $("#color").val().toLowerCase(),
            coordinatesToTHREEVector3(x1, y1, z1),
            coordinatesToTHREEVector3(x2, y2, z2),
            coordinatesToTHREEVector3(x3, y3, z3)
        );

        buttonCreatePlane();
        return;

    }




    if($("#renderer").hasClass("createPointConnection") && $("#renderer").find(".object.point.selected").length != 0){

        var first_point = $("#renderer").find(".object.point.selected");

        var x1 = first_point.attr("x");
        var y1 = first_point.attr("y");
        var z1 = first_point.attr("z");

        $("#renderer > div > .selected").removeClass("selected");
        $($(this).parent().find(".object." + $(this).attr("class").split(" ").pop())).addClass("selected");

        var second_point = $("#renderer").find(".object.point.selected");

        var x2 = second_point.attr("x");
        var y2 = second_point.attr("y");
        var z2 = second_point.attr("z");

        createPointConnection(false, false, $("#color").val().toLowerCase(),
            coordinatesToTHREEVector3(x1, y1, z1),
            coordinatesToTHREEVector3(x2, y2, z2)
        );

        buttonCreatePointConnection();
        return;

    }

    var object_class = $(this).attr("class").split(" ").pop();

    if(!$("#renderer").hasClass("createPlane"))
        $("#renderer > div > .selected").removeClass("selected");
    $($(this).parent().find(".object." + object_class)).addClass("selected");

    if(!$("#renderer").hasClass("createPlane"))
        $("#objectbox .selected").removeClass("selected");
    $("#objectbox .object[linked_object='" + object_class + "']").addClass("selected");
    $("#objectbox .object-wrapper").scrollTop(0).scrollTop($("#objectbox .object.selected").offset().top - $("#objectbox").offset().top - 52);

    if($("#renderer").hasClass("selectCameraTarget")) {

        var selectedPoint = $("#renderer").find(".object.point.selected");

        controls.target = coordinatesToTHREEVector3(selectedPoint.attr("x"), selectedPoint.attr("y"), selectedPoint.attr("z"));
        controls.update();

        setRendererUserMode("move");
        return;

    }

    var selectedObject = $("#renderer").find(".object.selected");

    if(selectedObject.hasClass("point")){

        $("#toolbox #object-tooltip.tooltip").html("Punkt Nr." + selectedObject.attr("number") + " <b>(" + selectedObject.attr("x") + "|" + selectedObject.attr("y") + "|" + selectedObject.attr("z") + ")</b>").addClass("active");

    }else if(selectedObject.hasClass("pointConnection")){

        $("#toolbox #object-tooltip.tooltip").html("Strecke Nr." + selectedObject.attr("number") + " <b>(" + selectedObject.attr("start_x") + "|" + selectedObject.attr("start_y") + "|" + selectedObject.attr("start_z") + ")</b> bis <b>(" + selectedObject.attr("end_x") + "|" + selectedObject.attr("end_y") + "|" + selectedObject.attr("end_z") + ")</b>").addClass("active");

    }

}

function selectObjectByObjectBox() {

    if($(this).hasClass("selected"))
        return;

    var object_class = $(this).attr("linked_object");
    var object_type = $(this).attr("linked_object_type");
    if(object_type == "point" && rendererUserMode != "selectPoint")
        setRendererUserMode("selectPoint");
    if(object_type == "pointConnection" && rendererUserMode != "selectPointConnection")
        setRendererUserMode("selectPointConnection");

    $("#renderer > div > ." + object_class).each(function (){
        $(this).not(".selected").click();
    });

}

// ### GUI-Button Funktionen

function buttonCreatePoint() {

    setRendererUserMode("move");
    setRendererActionMode("createPoint");

}

function buttonSubmitCreatePoint() {

    var createPointDialog = $("#createpoint-dialogbox");

    var x_value = (createPointDialog.find("#x-value").val() !== "") ? createPointDialog.find("#x-value").val() : 0;
    var y_value = (createPointDialog.find("#y-value").val() !== "") ? createPointDialog.find("#y-value").val() : 0;
    var z_value = (createPointDialog.find("#z-value").val() !== "") ? createPointDialog.find("#z-value").val() : 0;

    createPoint(false, $("#color").val().toLowerCase(), x_value, y_value, z_value);

}

function buttonCreatePointConnection() {

    setRendererUserMode("selectPoint");
    setRendererActionMode("createPointConnection");

}

function buttonCreatePlane() {

    setRendererUserMode("selectPoint");
    setRendererActionMode("createPlane");

}

// deletes selected Object... creates request to delete clicked object
function deleteObject() {

    setRendererUserMode("move");

    var objectBoxObjectEntry = $(this).closest(".object");
    var objectClass = objectBoxObjectEntry.attr("linked_object");
    var objectType = objectBoxObjectEntry.attr("linked_object_type");

    createChangeRequest(
        {
            action: "delete",
            type: objectType,
            properties: {
                objectClass: objectClass
            }
        }
    );

    //executeDeleteObject(objectClass, objectType);

}

function executeDeleteObject(objectClass, objectType) {

    $("#objectbox .object[linked_object='" + objectClass + "']").remove();

    console.log(objectType);
    console.log(objectClass);

    if(objectType === "plane"){

        scene_webGL.remove(scene_webGL.getObjectByName(objectClass));
        animate();

    } else {

        // each, wegen den strecken, müssen zwei mal gelöscht werden
        $("#renderer > div > .object." + objectClass).each(function () {

            console.log($(this));

            scene.remove(scene.getObjectByName($(this).removeClass("selected").attr("class")));

        });

    }

    getNewMaxXYZValue();

}

function setNameByObjectBox() {

    var object = $("." + $(this).closest(".object").attr("linked_object").replace(" ", "."));

    if(object.attr("customname")) {
        object.attr("customname", "");
    } else {
        var name = prompt('Name für den Punkt:');

        if(name != null)
            object.attr("customname", name + " (" + object.attr("x") + "|" + object.attr("y")  + "|" + object.attr("z")  + ")");
    }

}

function deleteAll() {

    $("#objectbox .wrapper div.object").each(function (){
        $(this).find(".deleteElementButton").click();
    });

}

function buttonToggleCustomnameSize() {

    switch (customnameSize){
        case "normal":
            customnameSize = "smaller";
            break;
        case "smaller":
            customnameSize = "hidden";
            break;
        case "hidden":
            customnameSize = "normal";
            break;
        default:
            customnameSize = "normal";
            break;
    }

    $("#renderer > div").removeClass(customnameSizes).addClass(customnameSize);

}

function buttonResetRotation() {

    controls.target = coordinatesToTHREEVector3(0, 0, 0);

    rotationPosition++;
    if(rotationPosition == 5)
        rotationPosition = 1

    switch (rotationPosition){
        case 1:
            camera.position.set(150, 150, 150);
            break;
        case 2:
            camera.position.set(260, 0, 0);
            break;
        case 3:
            camera.position.set(0, 0, 260);
            break;
        case 4:
            camera.position.set(0, 260, 0);
            break;
        default:
            camera.position.set(150, 150, 150);
            break;
    }

    controls.update();

    $("#additional-axle-ends div").removeClass("visible");

}

function buttonSelectCameraTarget() {

    setRendererUserMode("selectPoint");
    setRendererActionMode("selectCameraTarget");

}

function buttonResetCameraTarget() {

    controls.target = coordinatesToTHREEVector3(0, 0, 0);
    controls.update();

}

function getCameraAndMousePosition() {

    return {
        target: controls.target,
        position: camera.position,
        zoom: camera.zoom,
        mouse: currentMousePos
    };

}

function setCameraAndMousePosition(cameraAndMousePosition) {

    controls.target = new THREE.Vector3( cameraAndMousePosition.target.x, cameraAndMousePosition.target.y, cameraAndMousePosition.target.z);
    camera.position.copy(cameraAndMousePosition.position);
    camera.zoom = cameraAndMousePosition.zoom;
    $("#mirrored-cursor").css({"transform": "translate(" + cameraAndMousePosition.mouse.x + ", " + cameraAndMousePosition.mouse.y + ")"});

    camera.updateProjectionMatrix();
    controls.update();

    calculateAdditionalAxles();

}

function toggleMirroring() {

    if(!$("#toolbox #button-mirror").hasClass("active")) {
        startMirroring();
        $("#toolbox #button-mirror").addClass("active");
        createNotification("info", "Spiegelung gestartet.");
        socket.emit('pushMirroringState', true);
    } else {
        stopMirroring();
        $("#toolbox #button-mirror").removeClass("active");
        createNotification("info", "Spiegelung gestoppt.");
        socket.emit('pushMirroringState', false);
    }


}

function buttonToggleObjectBoxSize() {

    if($("#objectbox").hasClass("small")) {
        $("#objectbox").removeClass("small");
    } else {
        $("#objectbox").addClass("small");
    }


}

// ### Funktionen für Import/Export

function exportAsJSON() {

    var objectArray = [];

    $("#renderer > div > .object").each(function () {

        if($(this).hasClass("point")){

            var object = {
                type: "point",
                properties: {
                    domClass: $(this).attr("class"),
                    customname: $(this).attr("customname"),
                    color: $(this).css("background-color"),
                    number: $(this).attr("number"),
                    x: $(this).attr("x"),
                    y: $(this).attr("y"),
                    z: $(this).attr("z")
                }
            };

            objectArray.push(object);

        }else if($(this).hasClass("pointConnection") && $(this).attr("second-perspective") === undefined){

            var object = {
                type: "pointConnection",
                properties: {
                    domClass: $(this).attr("class"),
                    color: $(this).css("background-color"),
                    number: $(this).attr("number"),
                    start_x: $(this).attr("start_x"),
                    start_y: $(this).attr("start_y"),
                    start_z: $(this).attr("start_z"),
                    end_x: $(this).attr("end_x"),
                    end_y: $(this).attr("end_y"),
                    end_z: $(this).attr("end_z")
                }
            };

            objectArray.push(object);

        }

    });

    // https://stackoverflow.com/a/53127989
    scene_webGL.traverse(function(plane) {
        if(plane.name != null && plane.name !== "") {

            var object = {
                type: "plane",
                properties: {
                    name: plane.name,
                    number: plane._number,
                    color: plane._color,
                    position_a_x: plane._position_a.x,
                    position_a_y: plane._position_a.y,
                    position_a_z: plane._position_a.z,
                    position_b_x: plane._position_b.x,
                    position_b_y: plane._position_b.y,
                    position_b_z: plane._position_b.z,
                    position_c_x: plane._position_c.x,
                    position_c_y: plane._position_c.y,
                    position_c_z: plane._position_c.z
                }
            };

            objectArray.push(object);

        }
    });


    var JSObject = {objects: objectArray};

    // https://www.tutorialrepublic.com/faq/how-to-convert-js-object-to-json-string.php
    return JSON.stringify(JSObject);

}

function downloadExportBlob() {

    // https://shinglyu.com/web/2019/02/09/js_download_as_file.html
    // https://stackoverflow.com/a/19328891
    var data = new Blob([exportAsJSON()], {type: 'text/plain'});

    var exportUrl = window.URL.createObjectURL(data);
    $("#hidden_export_link").attr("href", exportUrl);
    document.getElementById("hidden_export_link").click();
    window.URL.revokeObjectURL(exportUrl);

}

// https://stackoverflow.com/a/26298948
function importFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        importJSON(contents);
    };
    reader.readAsText(file);
}

function importJSON(jsonString, fromsocket = false) {

    var JSObject = JSON.parse(jsonString);
    var objectArray = JSObject.objects;

    objectArray.forEach(function (object){

        if(object.type == "point"){

            var point = createPoint(fromsocket, object.properties.color, object.properties.x, object.properties.y, object.properties.z);
            if(object.properties.customname !== "" && object.properties.customname != null){
                $(point).attr("customname", object.properties.customname);
            }

        }else if(object.type == "pointConnection"){

            createPointConnection(fromsocket, true, object.properties.color, coordinatesToTHREEVector3(object.properties.start_x, object.properties.start_y, object.properties.start_z), coordinatesToTHREEVector3(object.properties.end_x, object.properties.end_y, object.properties.end_z));

        }else if(object.type == "plane"){

            createPlane(fromsocket,true, object.properties.color,
                coordinatesToTHREEVector3(object.properties.position_a_x, object.properties.position_a_y, object.properties.position_a_z),
                coordinatesToTHREEVector3(object.properties.position_b_x, object.properties.position_b_y, object.properties.position_b_z),
                coordinatesToTHREEVector3(object.properties.position_c_x, object.properties.position_c_y, object.properties.position_c_z)
            );

        }

    });

}

function createNotification(type, text) {

    $('#notifications').prepend("<div class='notification " + type + "'>" + text + "</div>");

}

var baseapp = {};

baseapp.createNotification = createNotification;

baseapp.createPoint = createPoint;
baseapp.createPointConnection = createPointConnection;
baseapp.createPlane = createPlane;

baseapp.executeDeleteObject = executeDeleteObject;

baseapp.coordinatesToTHREEVector3 = coordinatesToTHREEVector3;
baseapp.THREEVector3ToCoordinates = THREEVector3ToCoordinates;

function setClientIsHostingRoom(boolean) {
    clientIsHostingRoom = boolean;
}
baseapp.setClientIsHostingRoom = setClientIsHostingRoom;

function getClientIsHostingRoom() {
    return clientIsHostingRoom;
}
baseapp.getClientIsHostingRoom = getClientIsHostingRoom;

function updateBroadcastCounter(type) {
    if(type == "point"){
        broadcastedPointCounter++;
    }else if(type == "pointConnection"){
        broadcastedPointConnectionCounter++;
    }else if(type == "plane"){
        broadcastedPlaneCounter++;
    }
}
baseapp.updateBroadcastCounter = updateBroadcastCounter;

function setCounters(counters) {
    pointCounter = counters.points;
    pointConnectionCounter = counters.pointConnections;
    planeCounter = counters.planes;
}
baseapp.setCounters = setCounters;

function getCounters() {
    return {points: broadcastedPointCounter, pointConnections: broadcastedPointConnectionCounter, planes: broadcastedPlaneCounter};
}
baseapp.getCounters = getCounters;

function setRoomId(int) {
    roomId = int;
}
baseapp.setRoomId = setRoomId;

baseapp.setCameraAndMousePosition = setCameraAndMousePosition;
baseapp.getCameraAndMousePosition = getCameraAndMousePosition;

baseapp.setRendererUserMode = setRendererUserMode;

baseapp.exportAsJSON = exportAsJSON;
baseapp.importJSON = importJSON;

window.baseapp = baseapp;