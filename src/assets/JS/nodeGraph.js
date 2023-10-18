//pointer variables
var _mappingPointer;
var _cryptoService;
var _themeServicePointer;
var mqttServicePointer;
var restServicePointer;
var _loaderPointer;
var snackBarPointer;
var routerPointer;

//utility variables
var fleetConfig;
var reverse = false;
var type_robot_live = "amr";

//canvas variables
var stage;
var image;
var stageX;
var stageY;
var scaleCustom;
var canvas;
var img;
var centerX;
var centerY;
var startShiftX;
var startShiftY;
var startScaleX;
var startScaleY;

//payload variables
var velocePayload;
var veloceAllPayloads;

//stations variables
var veloceStation;
var zippyChargeStation;
var allStations;

//reservation and barcode variables
var zippyReservation;

//robot variables
var robotPathMap;
var robotPathDisplayMap;
var robotReservationDisplayMap;
var robotReservationMap;
var robotsColorsMap;
var robotsMap;
var virtualRobotMap;

//nodegraph variables
var NodeMap;
var edgeMap;
var deleteAllowedNodes = false;
var edgeDrawingBoolean = false;
var createEdge = true;
var isUniDirectional = false;
var isDelete = false;
var deleteAllowed = false;
var nodesPointArray;
var graphCanvasArr;
edgesForFms = [];



/**************************************************/
/*    Pointers related functions and variables    */
/**************************************************/

function loadMappingPointer(ptr) {
    _mappingPointer = ptr; // loads the pointer for mapping component
}

function setCryptoServicePointer(pointer) {
    _cryptoService = pointer; // loads the pointer for cryptojs
}

function loadThemePointer(ptr) {
    _themeServicePointer = ptr; // loads the pointer for theme service
}

function loadRestService(restService) {
    return new Promise((resolve, reject) => {
        restServicePointer = restService; // loads the pointer for rest service
        resolve();
    });
}

function setLoader(loader) {
    _loaderPointer = loader; // loads the pointer for loader
}

function loadSnackBarComponent(snackbar) {
    return new Promise((resolve, reject) => {
        snackBarPointer = snackbar; // loads the pointer for snackbar component
        resolve();
    });
}

function loadRouterPointer(rt) {
    routerPointer = rt; // loads the pointer for router
}


/**************************************************/
/*            Utility Helper Function             */
/**************************************************/

function calculateRobotSize() {
    var sizeX = 5.951 * image.scaleX;
    var scaleY = 5.94343 * image.scaleY;

    return {
        sizeX: sizeX,
        scaleY: scaleY,
    };
}

function quaternionToGlobalTheta(orientation) { //converts the quaternion orientation to global theta
    var q0 = orientation.w;
    var q1 = orientation.x;
    var q2 = orientation.y;
    var q3 = orientation.z;
    // Canvas rotation is clock wise and in degrees
    return ((Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3)) * 180.0) / Math.PI);
}

function setFleetConfig(config) { // assigns the fleet options to the variable
    fleetConfig = config;
    // console.log(fleetConfig);
}

function RotateStageAroundCentre(value) { // used to rotate the map canvas
    stage.rotation = value;
    stage.update();
}

function transform(pose_for_transform) { // used to find the transformation of real-world coordinates to pixel-world coordinates 
    var x = pose_for_transform.position.x;
    var y = pose_for_transform.position.y;

    var transalateX = x * Math.cos((-0 * Math.PI) / 180) + y * Math.sin((-0 * Math.PI) / 180);
    var transalateY = -1 * x * Math.sin((-0 * Math.PI) / 180) + y * Math.cos((-0 * Math.PI) / 180);

    //! edited code [0.084 = real width/pixel width]
    //! adidas width=127.5 and height=88.2

    var x1;
    var y1;
    var thetaD;

    switch (type_robot_live) {
        case "amr":
            x1 = ((transalateX + Number(window["env"]["amrxOrigin"])) / (window["env"]["amrxLength"] / image.image.width)) * image.scaleX;
            y1 = (image.image.height - (transalateY + Number(window["env"]["amryOrigin"])) / (window["env"]["amryLength"] / image.image.height)) * image.scaleY;
            thetaD = -quaternionToGlobalTheta(pose_for_transform.orientation || 0);
            break;

        case "veloce":
            x1 = ((Number(x) + window["env"]["velocexOrigin"]) / (0.00839787234)) * image.scaleX;
            y1 = ((image.image.height) - (Number(y) + window["env"]["veloceyOrigin"]) / (0.01108)) * image.scaleY;
            thetaD = pose_for_transform.position.z + 90;
            break;

        case "zippy":
            x1 = (image.image.width - x / 0.01504) * image.scaleX;
            y1 = (y / 0.01505) * image.scaleY;
            thetaD = pose_for_transform.position.z || 0;
            break;

        case "zippy10lower":
            x1 = (x / (17.5 / image.image.width)) * image.scaleX;
            y1 = (y / (19.04 / image.image.height)) * image.scaleY;
            thetaD = pose_for_transform.position.z || 0;
            break;

        case "zippy10upper":
            x1 = (x / (17.5 / image.image.width)) * image.scaleX;
            y1 = (y / (19.04 / image.image.height)) * image.scaleY;
            thetaD = pose_for_transform.position.z || 0;
            break;

        default:
            break;
    }

    var result = {
        x: x1,
        y: y1,
        theta: thetaD,
    };

    return result;
}

function reverseTransform(x, y, theta) { // used to find the transformation of pixel-world coordinates to real-world coordinates

    var r_x;
    var r_y;

    switch (type_robot_live) {
        case "amr":
            r_x = (x / image.scaleX) * (window["env"]["amrxLength"] / image.image.width) - Number(window["env"]["amrxOrigin"]);
            r_y = (y / image.scaleY - image.image.height) * (-1 * (window["env"]["amryLength"] / image.image.height)) - Number(window["env"]["amryOrigin"]);
            break;

        //! to be derived
        case "zippy": r_x = (x / image.scaleX) * (144 / image.image.width) - Number(96.4);
            r_y = (y / image.scaleY - image.image.height) * (-1 * (142 / image.image.height)) - Number(21.2);
            break;

        //! to be derived
        case "zippy10upper": r_x = (x / image.scaleX) * (144 / image.image.width) - Number(96.4);
            r_y = (y / image.scaleY - image.image.height) * (-1 * (142 / image.image.height)) - Number(21.2);
            break;

        //! to be derived
        case "zippy10lower": r_x = (x / image.scaleX) * (144 / image.image.width) - Number(96.4);
            r_y = (y / image.scaleY - image.image.height) * (-1 * (142 / image.image.height)) - Number(21.2);
            break;

        //! to be derived
        case "veloce": r_x = (x / image.scaleX) * (144 / image.image.width) - Number(96.4);
            r_y = (y / image.scaleY - image.image.height) * (-1 * (142 / image.image.height)) - Number(21.2);
            break;

        default:
            break;
    }

    return { x: r_x, y: r_y, theta: theta };
}


function getRandomColor() { // returns random color
    var letters = '01234ABC56789DEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**************************************************/
/*           Canvas related functions             */
/**************************************************/

function loadMapCanvas(mqttService, src, visualizer, topDiv, robots_type) { // loads the map on the canvas woth the correct scale
    return new Promise((resolve, reject) => {
        type_robot_live = robots_type;
        NodeMap = new Map();
        nodesPointArray = [];
        graphCanvasArr = [];
        edgeMap = new Map();
        robotPathMap = new Map();
        zippyReservation = [];
        velocePayload = new Map();
        robotPathDisplayMap = new Map();
        robotReservationDisplayMap = new Map();
        robotReservationMap = new Map();
        robotsColorsMap = new Map();
        veloceAllPayloads = [];

        _loaderPointer.start();

        mqttServicePointer = mqttService;
        drawingCanvas = new createjs.Shape();
        stationsMap = new Map();
        robotsMap = new Map();
        veloceStation = new Map();
        zippyChargeStation = new Map();
        virtualRobotMap = new Map();
        canvas = document.getElementById(visualizer);
        var element = document.getElementById(topDiv);

        var element1 = document.getElementById("rightDiv");
        var element2 = document.getElementById("visualizerDiv");
        var element3 = document.getElementById("slider-container");

        window.onresize = function () {
            canvas.width = -element2.offsetLeft + element1.offsetLeft - 10;
            canvas.height = 0.82 * window.innerHeight - (element.offsetTop + element.offsetHeight + element3.offsetHeight);
        };

        setTimeout(function () {
            canvas.width = -element2.offsetLeft + element1.offsetLeft - 10;
            canvas.height = 0.82 * window.innerHeight - (element.offsetTop + element.offsetHeight + element3.offsetHeight);
        }, 1);

        stage = new createjs.Stage(canvas);
        // stage.regX=canvas.width;
        // stage.regY=canvas.height;
        // console.log(stage.regX
        //   )
        // stage.regX=image.image.width;
        // stage.regY=image.image.height;
        createjs.Touch.enable(stage);
        createjs.Ticker.framerate = 60;

        // createjs.Ticker.addEventListener('tick', stage);

        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        stage.addChild(drawingCanvas);
        stage.enableMouseOver(30);

        drawingCanvas.graphics
            .clear()
            .setStrokeStyle(1, "round", "round")
            .beginStroke("rgba(100,100,100,1)")
            .moveTo(0, 0)
            .lineTo(1, 1);
        stage.update();

        img = document.createElement("img");
        img.crossOrigin = "Anonymous";
        img.src = src;

        img.onload = function () {
            setTimeout(function () {
                handleImageLoad().then(
                    (res) => {
                        _loaderPointer.stop();
                        // stage.x = (image.image.width * image.scaleX) / 2;
                        // stage.y = (image.image.height * image.scaleY) / 2;
                        // stage.regX = (image.image.width * image.scaleX) / 2;
                        // stage.regY = (image.image.height * image.scaleY) / 2;
                        canvas.addEventListener("mousewheel", MouseWheelHandler, true);
                        canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, true);
                        resolve();
                    },
                    (err) => {
                        _loaderPointer.stop();
                    }
                );
            }, 1);
        };
    });
}

function handleImageLoad(event) {
    // setTimeout(function () {
    return new Promise((resolve, reject) => {
        image = new createjs.Bitmap(img);
        scaleWidth = canvas.width / image.image.width;
        scaleHeight = canvas.height / image.image.height;

        scaleCustom = Math.min(scaleWidth, scaleHeight);

        //console.log(scaleCustom);
        image.scaleX = scaleCustom;
        image.scaleY = scaleCustom;

        stage.addChild(image);

        createjs.Ticker.addEventListener("tick", handleTick);
        //console.log(image);
        // stage.x += (canvas.width - image.image.width * scaleCustom) / 2;
        enablePan();
        stage.update();
        resolve();
    });
    // }, 1000);
}

function enablePan() { //add event listener to enable pan on the stage
    stage.removeAllEventListeners();

    stage.addEventListener("mousedown", handleMouseDown);

    stage.addEventListener("pressmove", DragHandler);

    stage.addEventListener("pressup", findRobotAndOpen);
}

function handleTick(event) {
    stage.update();
}

function startPan(startX, startY) {
    stageX = startX;
    stageY = startY;
}

function pan(curX, curY) { // function to pan the canvas
    stage.x = stage.x + curX - stageX;
    stage.y = stage.y + curY - stageY;

    stageX = curX;
    stageY = curY;
}

var distance = 0;
var distance1 = 0;

function DragHandler(event) { //function that enables dragging of the map
    var zoom = 1;
    moved = true;
    // console.log(event['nativeEvent']['targetTouches'][2]['clientX']);
    // // console.log(Object.keys(event))
    if (event["nativeEvent"]["targetTouches"]) {
        if (event["nativeEvent"]["targetTouches"]["length"] == 2) {
            var x1 = event["nativeEvent"]["targetTouches"][0]["clientX"];
            var y1 = event["nativeEvent"]["targetTouches"][0]["clientY"];
            var x2 = event["nativeEvent"]["targetTouches"][1]["clientX"];
            var y2 = event["nativeEvent"]["targetTouches"][1]["clientY"];

            distance1 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

            if (distance == 0) {
                distance = distance1;
            } else {
                if (distance <= distance1) {
                    zoom = 1.02;
                } else {
                    zoom = 1 / 1.05;
                }
                distance = distance1;
                startZoom((x1 + x2) / 2, (y1 + y2) / 2);
                zoomZ(zoom);
            }
        } else {
            event.preventDefault();
            event.stopPropagation();
            mouseX = parseInt(event.stageX);
            mouseY = parseInt(event.stageY);

            pan(mouseX, mouseY);
        }
    } else {
        // // console.log(event['nativeEvent']['changedTouches']['length']);
        // tell the browser we're handling this event
        event.preventDefault();
        event.stopPropagation();
        mouseX = parseInt(event.stageX);
        mouseY = parseInt(event.stageY);
        pan(mouseX, mouseY);
    }
}

function handleMouseDown(event) {
    distance = 0;
    event.preventDefault();
    event.stopPropagation();
    startX = event.stageX;
    startY = event.stageY;
    startPan(startX, startY);
    isDown = true;
}

function MouseWheelHandler(event) {
    // console.log("MouseWheelHandler");
    if (Math.max(-1, Math.min(1, event.wheelDelta || -event.detail)) > 0) {
        zoom = 1.1;
    } else {
        zoom = 1 / 1.05;
    }

    startZoom(event.clientX, event.clientY);

    zoomZ(zoom);
}

function startZoom(centerx, centery) { //function to start zoom
    centerX = centerx;
    centerY = centery;
    startShiftX = stage.x;
    startShiftY = stage.y;
    startScaleX = stage.scaleX;
    startScaleY = stage.scaleY;
}

function zoomZ(zoom) {
    // console.log(zoom)
    if (startScaleX * zoom < 0.2) {
        zoom = 0.2 / startScaleX;
    }
    if (startScaleY * zoom > 100) {
        zoom = 100 / startScaleY;
    }
    stage.scaleX = startScaleX * zoom;
    stage.scaleY = startScaleY * zoom;

    stage.x = startShiftX - (centerX - startShiftX) * (stage.scaleX / startScaleX - 1);
    stage.y = startShiftY - (centerY - startShiftY) * (stage.scaleY / startScaleY - 1);
}

function computePoint1(x, y) {
    var testX = x - stage["x"];
    var testY = y - stage["y"];
    var testx = testX * Math.cos((stage.rotation * 3.14) / 180) + Math.sin((stage.rotation * 3.14) / 180) * testY;
    var testy = -testX * Math.sin((stage.rotation * 3.14) / 180) + Math.cos((stage.rotation * 3.14) / 180) * testY;
    var oldPtCustom = new createjs.Point(testx * (1 / stage["scaleX"]), testy * (1 / stage["scaleY"]));
    return oldPtCustom;
}

function findRobotAndOpen(event) {
    // add robot marker click listener

    if (event.target.isRobotMarker === undefined && event.target.isRobot === undefined) {
        return;
    }

    if (!moved) {
        // if (event.target.text && !event.target.isRobot) {
        // 	focusOnRobot(event.target.name, "");
        // } else if (event.target.isRobot) {
        // var temp;
        // if (event.target.type === "amr") {
        // 	temp = robotsMap.get(event.target.text - 1);
        // }
        // else {
        // 	temp = robotsMap.get(event.target.text || event.target.name);
        // }


        var id;
        if (event.target.isRobot) {
            if (type_robot_live === "amr")
                id = event.target.text - 1;
            else
                id = event.target.text;
        }

        if (event.target.isRobotMarker)
            id = event.target.name;

        focusOnRobot(id, "");
    }


    setTimeout(function () {
        moved = false;
    }, 100);
}

function saveMapImageNodeGraph() { //function to save the canvas as image
    var fullQuality = stage
        .toDataURL("image/png", 3.0)
        .replace("image/png", "image/octet-stream");
    window.location.href = fullQuality;
}

function clearCanvas() { //function to clear all points on the canvas
    if (stage) {
        stage.removeAllEventListeners();
        stage.removeAllChildren();
        robotsMap.clear();
        veloceStation.clear();
        zippyChargeStation.clear();
    }
}


/**************************************************/
/*           Payload related functions            */
/**************************************************/

function drawAllPayloads(payloads) { //function to plot all the payloadPoints

    var radius = (.2 / 0.01108) * image.scaleX;
    for (let i = 0; i < payloads.length; i++) {
        var payloadMarker = new createjs.Shape();

        var localPose = transform(payloads[i].pose);

        payloadMarker.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill(payloads[i].color)
            .drawCircle(0, 0, radius);

        var text = new createjs.Text(
            payloads[i].robot_id,
            "2px barlow",
            "black"
        );

        payloadMarker.text = text;
        payloadMarker.x = localPose.x;
        payloadMarker.y = localPose.y;
        text.x = localPose.x;
        text.y = localPose.y;

        veloceAllPayloads.push(payloadMarker);

        stage.addChild(payloadMarker);
        stage.addChild(text);

    }
    stage.update();
}

function removeAllPayload() { //function to remove all the payload points from the map
    for (let i = 0; i < veloceAllPayloads.length; i++) {
        stage.removeChild(veloceAllPayloads[i]);
        if (veloceAllPayloads[i].text) {
            stage.removeChild(veloceAllPayloads[i].text);
        }
    }
    veloceAllPayloads = [];
}

function drawPayload(payload, robotId) { //function to draw robot specific payload points
    tempArray = [];
    var radius = (.2 / 0.01108) * image.scaleX;

    for (let i = 0; i < payload.length; i++) {
        var payloadMarker = new createjs.Shape();

        var localPose = transform(payload[i].pose);

        payloadMarker.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill(payload[i].color)
            .drawCircle(0, 0, radius);

        var text = new createjs.Text(
            payload[i].robot_id,
            "2px barlow",
            "black"
        );

        payloadMarker.text = text;
        payloadMarker.x = localPose.x;
        payloadMarker.y = localPose.y;
        text.x = localPose.x;
        text.y = localPose.y;

        tempArray.push(payloadMarker);

        stage.addChild(payloadMarker);
        stage.addChild(text);

    }
    stage.update();
    velocePayload.set(robotId, tempArray);
}


function clearPayload(id) { //function to clear robot specific payloads
    return new Promise((resolve, reject) => {
        var temp = velocePayload.get(id);
        for (let i = 0; i < temp.length; i++) {
            stage.removeChild(temp[i]);
            if (temp[i].text) {
                stage.removeChild(temp[i].text);
            }
        }

        velocePayload.delete(id);
        console.log(velocePayload, "sdksh");

        resolve();
    });
}

/**************************************************/
/*           Stations related functions           */
/**************************************************/

function createAndUpdateZippyChargeStation(stations) {
    try {
        var stationMarker;
        for (let i = 0; i < stations.length; i++) {
            if (zippyChargeStation.has(stations[i].id)) {
                stationMarker = zippyChargeStation.get(stations[i].id);
                stationMarker.data = JSON.stringify(stations[i]);
                stationMarker.graphics._fill.style = stations[i].color;
            } else {
                stationMarker = new createjs.Shape();
                stationMarker.graphics
                    .beginFill(stations[i].color)
                    .drawRect(0, 0, 10, 18);
                stationMarker.regX = 10 / 2;
                stationMarker.regY = 18 / 2;
                var localPose = transform(stations[i].pose);
                stationMarker.x = localPose.x;
                stationMarker.y = localPose.y;
                stationMarker.name = stations[i].id;
                stationMarker.data = JSON.stringify(stations[i]);
                stationMarker.shadow = new createjs.Shadow("orange", 0, 0, 5);
                zippyChargeStation.set(stations[i].id, stationMarker);

                stationMarker.cursor = "pointer";
                stage.enableMouseOver();

                var text;
                text = new createjs.Text(
                    "Charge Stn: " + stations[i].id,
                    "1px barlow",
                    "black"
                );
                text.textBaseline = "alphabetic";
                text.font = "bold 22px barlow";
                text.visible = true;
                text.scaleX = 0.4;
                text.scaleY = 0.4;
                stationMarker.textId = text;
                stationMarker.textId.x = localPose.x - 25;
                stationMarker.textId.y = localPose.y + 20;

                // var html = createStationMenu(stations[i]);
                // var gg = new createjs.DOMElement(html);

                // stationMarker.text = gg;
                // stationMarker.id = text;
                // stationMarker.html = html;

                stage.addChild(stationMarker);
                stage.addChild(text);

                stationMarker.on("click", function (evt) {
                    // console.log(evt);
                    _mappingPointer.openStationDialogue(evt.target.data);
                    // stage.update();
                });
            }

        }

        stage.update();
    } catch (e) {
        console.log("Akhil caught an error in stations", e);
    }
}


function createAndUpdateChargeStation(stations) { //created and updates staions markers
    // return;
    var dim;
    var textColor = _themeServicePointer.currentTheme === 'light' ? 'black' : 'white';
    try {
        var stationMarker;
        for (let i = 0; i < stations.length; i++) {
            if (veloceStation.has(stations[i].locationIdWCS)) {
                stationMarker = veloceStation.get(stations[i].locationIdWCS);
                stationMarker.data = JSON.stringify(stations[i]);
                stationMarker.graphics._fill.style = stations[i].color || "rgba(255,255,0,1)";
            } else {
                if (type_robot_live === "veloce") {
                    dim = 3.5;
                }
                else {
                    dim = 7;
                }

                stationMarker = new createjs.Shape();
                stationMarker.graphics
                    .setStrokeStyle(0.001, "round", "round")
                    .beginStroke("#000")
                    .beginFill(stations[i].color || "rgba(255,0,0,1)")
                    .drawCircle(0, 0, dim);

                var localPose = transform(stations[i].dockPose);
                stationMarker.x = localPose.x;
                stationMarker.y = localPose.y;
                stationMarker.name = stations[i].locationIdWCS;
                stationMarker.data = JSON.stringify(stations[i]);
                stationMarker.shadow = new createjs.Shadow("orange", 0, 0, 5);
                veloceStation.set(stations[i].locationIdWCS, stationMarker);

                stationMarker.cursor = "pointer";
                stage.enableMouseOver();

                var text;
                text = new createjs.Text(
                    stations[i].locationIdWCS,
                    "1px barlow",
                    textColor
                );
                text.textBaseline = "alphabetic";
                text.font = "bold 24px barlow";
                text.visible = true;
                text.scaleX = 0.2;
                text.scaleY = 0.2;
                stationMarker.textId = text;
                stationMarker.textId.x = localPose.x - 10;
                stationMarker.textId.y = localPose.y + 25;

                // var html = createStationMenu(stations[i]);
                // var gg = new createjs.DOMElement(html);

                // stationMarker.text = gg;
                // stationMarker.id = text;
                // stationMarker.html = html;
                stage.addChild(text);
                stage.addChild(stationMarker);


                stationMarker.on("click", function (evt) {
                    _mappingPointer.openStationDialogue(evt.target.data);

                });
            }
        }
        stage.update();
    } catch (e) {
        console.log("Akhil caught an error in stations", e);
    }
}

function updateLocationColor(locationsL) { //update the color of stations based on the msg packet
    for (var i = 0; i < locationsL.length; i++) {
        if (allStations.has(locationsL[i].location)) {
            if (locationsL[i].isOccupied) {
                allStations.get(locationsL[i].location).graphics._fill.style = "rgba(143, 255, 143,.5)";
            }
            else {
                allStations.get(locationsL[i].location).graphics._fill.style = "rgba(112, 110, 255,.5)";
            }
        }
    }
}

function drawStationsOnMap(stations) { // create station markers on map for amrs
    allStations = new Map();

    var textColor = _themeServicePointer.currentTheme === 'light' ? 'black' : 'white';
    var radius = (.5 / (142 / image.image.height)) * image.scaleX;


    for (var i = 0; i < stations.length; i++) {
        if (stations[i].locationType > 1) {
            continue;
        }
        var station = new createjs.Shape();
        var localPose = transform(stations[i].dockPose);
        station.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill("rgba(255,0,0,0.4)")
            .drawCircle(0, 0, radius);

        var text = new createjs.Text(
            stations[i].locationIdWCS,
            "1px barlow",
            textColor
        );

        station.text = text;
        station.x = localPose.x;
        station.y = localPose.y;
        text.x = station.x;
        text.y = station.y;
        stage.addChild(text);
        allStations.set(stations[i].locationIdWCS, station);
        stage.addChild(station);

    }
    stage.update();
}


// ! not working for now
function createStationMenu(station) {
    // console.log("herein statiosn");
    var ul = document.createElement("ul");
    ul.style.listStyleType = "none";
    ul.style.paddingLeft = "0rem";
    ul.style.textAlign = "left";

    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.innerHTML = `<i class="fas fa-times"></i> &nbsp;`;
    btn.style.border = "none";
    btn.style.position = "absolute";
    btn.style.top = "-5px";
    btn.style.right = "-10px";
    btn.style.backgroundColor = "white";

    btn.onclick = function () {
        var removeText = veloceStation.get(station.id);
        removeText.html.style.display = "none";
        removeText.isOpen = false;
        stage.removeChild(removeText.text);
    };

    li.appendChild(btn);
    ul.appendChild(li);

    var para = document.createElement("p");
    var node = document.createTextNode(station.id);
    // var node = document.createTextNode("Work Hours: 9 Hours");

    para.appendChild(node);

    var html = document.createElement("div");
    html.id = station.id;
    html.className += "robotsAction";

    html.style.backgroundColor = "rgb(255 255 255 / 71%)";
    html.style.position = "relative";

    html.style.top = 0;
    html.style.left = 0;
    html.style.display = "none";
    html.style.textAlign = "center";
    html.style.paddingTop = "15px";

    html.appendChild(para);

    html.appendChild(ul);
    document.body.appendChild(html);

    return html;
}


/**************************************************/
/*   Reservation and barcode related functions    */
/**************************************************/
var heatmapMap;

function heatMapColorforValue(value) {
    var h = (1.0 - value) * 240;
    return "hsla(" + h + ", 100%, 50%,0.75)";
}

function createHeatMap(heatmap) {
    heatmapMap = new Map();
    var xlength = (heatmap.heatMap.resolution / (window["env"]["amrxLength"] / image.image.height)) * image.scaleX;
    var yLength = (heatmap.heatMap.resolution / (window["env"]["amryLength"] / image.image.width)) * image.scaleY;

    for (const [key, value] of Object.entries(heatmap.heatMap)) {

        var temp = [];
        if (value.values) {
            for (let i = 0; i < value.values.length; i++) {

                var tempHeatMarker = new createjs.Shape();
                var localPose = transform(value.values[i].pose);
                var heatMapColor = heatMapColorforValue(value.values[i].timeSpent / value.maxValue);

                tempHeatMarker.graphics
                    .setStrokeStyle(1000, "round", "round")
                    .beginFill(heatMapColor)
                    .drawRect(0, 0, xlength, yLength);

                tempHeatMarker.regX = xlength / 2;
                tempHeatMarker.regY = yLength / 2;

                tempHeatMarker.x = localPose.x;
                tempHeatMarker.y = localPose.y;

                temp.push(tempHeatMarker);
                stage.addChild(tempHeatMarker);
            }
            heatmapMap.set(key, temp);
        }
    }
}

function clearHeatMap() {
    for (const [key, value] of heatmapMap.entries()) {

        for (let i = 0; i < value.length; i++) {
            stage.removeChild(value[i]);
        }
        heatmapMap.delete(key);
    }

    stage.update();
}



function drawReservation(reservations, robotId) { // draw reservation for the particular zippy
    clearReservation();

    var tempArray = [];
    for (var i = 0; i < reservations.points.length; i++) {
        var reservationMarker = new createjs.Shape();
        var localPose = transform(reservations.points[i].pose);

        reservationMarker.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill("rgba(250,0,0,0.7)")
            .drawCircle(0, 0, 6.5);

        var text = new createjs.Text(
            "R-" + reservations.points[i].id,
            "8px barlow",
            "black"
        );

        reservationMarker.text = text;
        reservationMarker.x = localPose.x;
        reservationMarker.y = localPose.y;
        text.x = reservationMarker.x;
        text.y = reservationMarker.y;

        zippyReservation.push(reservationMarker);

        stage.addChild(reservationMarker);
        stage.addChild(text);
    }
    stage.update();

    // zippyReservation.set(robotId, tempArray)
}

function clearReservation() { //function to clear the reservation marker from the canvas 
    return new Promise((resolve, reject) => {

        for (let i = 0; i < zippyReservation.length; i++) {
            stage.removeChild(zippyReservation[i]);
            if (zippyReservation[i].text) {
                stage.removeChild(zippyReservation[i].text);
            }
        }
        zippyReservation = [];
        resolve();
    });
}

function drawBarcodeOnMap(grid) { //function to draw barcodes of zippy on the canvas
    for (var i = 0; i < grid.length; i++) {
        var station = new createjs.Shape();
        var localPose = transform(grid[i].pose);
        station.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill("rgba(255,0,0,0.5)")
            .drawCircle(0, 0, 3.5);

        // var text = new createjs.Text(stations[i].locationIdWCS, "1px barlow", "black");

        station.x = localPose.x;
        station.y = localPose.y;
        stage.addChild(station);
    }
    stage.update();

}

var heatmapMap;

function heatMapColorforValue(value) {
    var h = (1.0 - value) * 240;
    return "hsla(" + h + ", 100%, 50%,0.75)";
}

function createHeatMap(heatmap) {
    heatmapMap = new Map();

    var xlength = (heatmap.heatMap.resolution / (142 / image.image.height)) * image.scaleX;
    var yLength = (heatmap.heatMap.resolution / (144 / image.image.width)) * image.scaleY;

    for (const [key, value] of Object.entries(heatmap.heatMap)) {

        var temp = [];

        if (value.values) {
            for (let i = 0; i < value.values.length; i++) {

                var tempHeatMarker = new createjs.Shape();

                var localPose = transform(value.values[i].pose);

                var heatMapColor = heatMapColorforValue(value.values[i].timeSpent / value.maxValue);

                // var hexString = (Math.floor((value.values[i].timeSpent / value.maxValue) * 255)).toString(16);
                // console.log(value.color, "----", value.values[i].timeSpent, "-----", hexString);

                // console.log(heatMapColor, "color");

                tempHeatMarker.graphics
                    .setStrokeStyle(1000, "round", "round")
                    .beginFill(heatMapColor)
                    .drawRect(0, 0, xlength, yLength);

                tempHeatMarker.regX = xlength / 2;
                tempHeatMarker.regY = yLength / 2;

                tempHeatMarker.x = localPose.x;
                tempHeatMarker.y = localPose.y;
                temp.push(tempHeatMarker);
                stage.addChild(tempHeatMarker);
            }
            heatmapMap.set(key, temp);
        }

    }
}

function clearHeatMap() {
    for (const [key, value] of heatmapMap.entries()) {

        for (let i = 0; i < value.length; i++) {
            stage.removeChild(value[i]);
        }

        heatmapMap.delete(key);
    }

    stage.update();
}


/**************************************************/
/*           Robots related functions             */
/**************************************************/


function robotMarkerFunction(options) {
    var x = document.createElement("IMG");
    x.setAttribute("src", options.src);
    // x.setAttribute("width", "2");
    // x.setAttribute("height", "2");
    x.setAttribute("alt", "robots");
    x.crossOrigin = "Anonymous";
    return x;
}

function showAllRobotPaths(val) { // function which enables the display of all robot paths
    [...robotPathDisplayMap.keys()].forEach((key) => {
        robotPathDisplayMap.set(key, val);
        if (!val) {
            clearRobotPath(key);
        }
    });
}

function clearRobotPath(id) { // clear the path for the particular robot id
    var temp = robotPathMap.get(id);
    stage.removeChild(temp);
    robotPathMap.delete(id);
}

function formRobotPath(robot) { // creates robot path on the map
    var pathMark = new createjs.Shape();
    let g = pathMark.graphics;
    g.beginStroke(robotsColorsMap.get(robot.id));

    var strokeWidth;
    if (robot.type === "amr") {
        strokeWidth = 1.5;
    }
    else if (robot.type === "VELOCE") {
        strokeWidth = 0.75;
    }

    g.setStrokeStyle(strokeWidth, "round", "round");
    var localPose;
    var oldPose;
    localPose = transform(robot.pose);
    oldPose = localPose;

    g.moveTo(localPose.x, localPose.y);

    for (let i = 0; i < robot.path.length; i++) {
        localPose = transform(robot.path[i].pose);
        g.lineTo(localPose.x, localPose.y);

    }

    stage.addChild(pathMark);
    // stage.update();
    robotPathMap.set(robot.id, pathMark);
}

//functions for reservation

function showAllRobotReservation(val) { // function which enables the display of all robot reservation
    [...robotReservationDisplayMap.keys()].forEach((key) => {
        robotReservationDisplayMap.set(key, val);
        if (!val) {
            clearRobotReservation(key);
        }
    });
}

function clearRobotReservation(id) { // clear the reservation for the particular robot id
    var temp = robotReservationMap.get(id);

    if (temp === undefined)
        return;

    for (let i = 0; i < temp.length; i++) {
        stage.removeChild(temp[i]);
    }

    robotReservationMap.delete(id);
}

function formRobotReservation(robot) { // creates robot reservation on the map

    var tempArray = [];

    for (var i = 0; i < robot.reservations.length; i++) {
        var reservationMarker = new createjs.Shape();
        var localPose = transform(robot.reservations[i].pose);

        reservationMarker.graphics
            .setStrokeStyle(1000, "round", "round")
            .beginFill(robotsColorsMap.get(robot.id))
            .drawRect(0, 0, 2.5, 2.5);

        reservationMarker.regX = 2.5 / 2;
        reservationMarker.regY = 2.5 / 2;

        reservationMarker.x = localPose.x;
        reservationMarker.y = localPose.y;

        tempArray.push(reservationMarker);

        stage.addChild(reservationMarker);
    }

    robotReservationMap.set(robot.id, tempArray);
}

//function to create blinking
function createBlink(robot, marker) {
    if (robot.blink_colour) {
        if (marker.graphics._fill.style == "white") {
            var tempCol = robot.color_state + "1)";
            marker.graphics._fill.style = tempCol;
        } else {
            marker.graphics._fill.style = "white";
        }
    } else {
        var tempCol = robot.color || "green";
        marker.graphics._fill.style = tempCol;
    }
}

function createAndUpdateRobots(robots, robotOption) { //create and updates the robot markers at each mqqt msg receive
    // console.log(robots);
    try {
        var length;
        var width;

        if (robotOption.type === "amr") {
            length = (1.1 / (window["env"]["amryLength"] / image.image.height)) * image.scaleX;
            width = (1.5 / (window["env"]["amrxLength"] / image.image.width)) * image.scaleY;
            // length = (1.2 / (142 / image.image.height)) * image.scaleX;
            // width = (1.6 / (144 / image.image.width)) * image.scaleY;
        } else if (robotOption.type === "veloce") {
            length = (0.55 / (0.01108)) * image.scaleX;
            width = (1.25 / (0.00839787234)) * image.scaleY;

            // length = (1.01 / (0.01108)) * image.scaleX;
            // width = (1.6 / (0.00839787234)) * image.scaleY;

        } else if (robotOption.type === "zippy") {
            length = (0.3 / 0.01505) * image.scaleX;
            width = (0.3 / 0.01505) * image.scaleY;
        }
        else if (robotOption.type === "zippy10upper") {
            length = (0.3 / (17.5 / image.image.width)) * image.scaleY;
            width = (0.52 / (19.04 / image.image.height)) * image.scaleX;
        }
        else if (robotOption.type === "zippy10lower") {
            length = (0.3 / (17.5 / image.image.width)) * image.scaleX;
            width = (0.52 / (19.04 / image.image.height)) * image.scaleY;
        }


        if (robots == null || robots == []) {
            return;
        }

        for (var i = 0; i < robots.length; i++) {
            if (robotsMap.has(robots[i].id)) {

                var localPose = transform(robots[i].pose);
                if (robots[i].type === "VELOCE") {
                    robotMarker = robotsMap.get(robots[i].id).children[1];
                    robotsMap.get(robots[i].id).x = localPose.x;
                    robotsMap.get(robots[i].id).y = localPose.y;
                    robotsMap.get(robots[i].id).rotation = localPose.theta;
                }

                else {
                    robotMarker = robotsMap.get(robots[i].id);
                    robotMarker.x = localPose.x;
                    robotMarker.y = localPose.y;
                    robotMarker.rotation = localPose.theta;
                }

                robotMarker.textId.x = localPose.x - 1.5;
                robotMarker.textId.y = localPose.y + 2;
                robotMarker.html.childNodes[2].value = Number(robots[i].battery) / 100;

                robotMarker.html.childNodes[1].innerHTML =
                    "Battery : " + robots[i].battery.toFixed(2) + "%";
                robotMarker.html.childNodes[3].innerHTML =
                    "Task : " + robots[i].current_task;

                robotMarker.text.scaleX = 1 / stage.scaleX;
                robotMarker.text.scaleY = 1 / stage.scaleY;


                if (robots[i].reservations && robotReservationDisplayMap.get(robots[i].id)) {
                    try {
                        if (robotReservationMap.has(robots[i].id)) {
                            clearRobotReservation(robots[i].id);
                        }
                        formRobotReservation(robots[i]);
                    }
                    catch (er) { console.log(er); }
                }

                if ((robots[i].type === "amr" || robots[i].type === "VELOCE") && robotPathDisplayMap.get(robots[i].id)) {
                    try {
                        if (robotPathMap.has(robots[i].id)) {
                            clearRobotPath(robots[i].id);
                        }
                        formRobotPath(robots[i]);
                    } catch (er) { }
                }

                if ((robots[i].type === "zippy" || robots[i].type === "amr") && robots[i].payload) {
                    if (robots[i].payload[0]) {
                        if (robots[i].type === "amr") {
                            robotMarker.payload.graphics._fill.style = "gold";
                        }
                        else {
                            robotMarker.payload.graphics._fill.style = "#78BE21";
                        }
                    }
                    else {
                        robotMarker.payload.graphics._fill.style = "transparent";
                    }

                    robotMarker.payload.x = localPose.x;

                    if (robots[i].type === "amr")
                        robotMarker.payload.y = localPose.y;

                    else
                        robotMarker.payload.y = localPose.y - 15;

                }

                if (robots[i].type == "VELOCE") {
                    // robotMarker.graphics._fill.style = "rgba(255, 242, 235,0.1)";

                    robotsMap.get(robots[i].id).shadow.color = robots[i].color_state + "1)";
                    // robotMarker.graphics._stroke.style = robots[i].color_state;
                    createBlink(robots[i], robotMarker);
                }
                else {
                    createBlink(robots[i], robotMarker);
                }

                robotMarker.visible = true;

                if (robots[i].type == "zippy") {
                    if (robotPathDisplayMap.get(robots[i].id)) {
                        var path;
                        if (robotMarker.path) {
                            path = robotMarker.path;
                        } else {
                            path = new createjs.Shape();
                            stage.addChild(path);

                            robotMarker.path = path;
                        }

                        robotMarker.goalLocation = robots[i].target;
                        var targetPosition = transform(robots[i].target);

                        path.graphics
                            .clear()
                            .setStrokeStyle(1.3, "round", "round")
                            .beginStroke("blue")
                            .moveTo(targetPosition.x, targetPosition.y)
                            .lineTo(localPose.x, localPose.y);

                        robotPathMap.set(robots.id, path);
                    }
                    else {
                        if (robotPathMap.get(robots.id))
                            stage.removeChild(robotPathMap.get(robots.id));

                    }
                }

                if (robots[i].type == "VELOCE") {

                    // console.log(robotMarker.NodesOnTop);
                    for (var nn = 0; nn < robots[i].payload_color.length; nn++) {

                        if (robotMarker.NodesOnTop) {
                            robotMarker.NodesOnTop[nn].x = localPose.x;
                            robotMarker.NodesOnTop[nn].y = localPose.y;
                            robotMarker.NodesOnTop[nn].rotation = localPose.theta;

                            stage.setChildIndex(robotMarker.NodesOnTop[nn], stage.numChildren - 2);
                            stage.setChildIndex(robotMarker.textId, stage.numChildren - 1);

                            if ((stage.scaleX >= 1 && stage.scaleY >= 1) && robots[i].blink_colour === false) {
                                robotMarker.NodesOnTop[nn].graphics._fill.style = robots[i].payload_color[nn];
                                robotMarker.NodesOnTop[nn].graphics._stroke.style = "black";
                            }
                            else {
                                robotMarker.NodesOnTop[nn].graphics._fill.style = "transparent";
                                robotMarker.NodesOnTop[nn].graphics._stroke.style = "transparent";
                            }
                        }
                    }

                    // stage.setChildIndex(robotMarker.text, 102);
                }

                robotMarker.text1.x = robotMarker.x + canvas.getBoundingClientRect().left / stage.scaleX + 20;

                robotMarker.text1.y = robotMarker.y + canvas.getBoundingClientRect().top / stage.scaleY - 80;
            } else {
                // var robotMarker = new createjs.Bitmap(image_robot);
                var color = robots[i].color || "green";
                var robotMarker;
                var robotContainer;
                var bitmap;
                var payloadMarker;

                if (robots[i].type == "amr") {

                    robotMarker = new createjs.Shape();
                    robotsColorsMap.set(robots[i].id, getRandomColor());
                    robotMarker.graphics
                        .beginStroke(robotsColorsMap.get(robots[i].id))
                        .setStrokeStyle(0.7)
                        .beginFill(color)
                        .drawRect(0, 0, width, length);
                    robotMarker.regX = width / 2;
                    robotMarker.regY = length / 2;
                    robotPathDisplayMap.set(robots[i].id, false);

                    payloadMarker = new createjs.Shape();

                    payloadMarker.graphics
                        .beginStroke("transparent")
                        .setStrokeStyle(0.1)
                        .beginFill("transparent")
                        .drawCircle(0, 0, 2.2);

                    var tempPose = transform(robots[i].pose);
                    payloadMarker.x = tempPose.x;
                    payloadMarker.y = tempPose.y;

                    payloadMarker.isRobotMarker = true;
                    payloadMarker.name = robots[i].id;

                    robotMarker.payload = payloadMarker;

                    robotReservationDisplayMap.set(robots[i].id, false);

                } else if (robots[i].type == "VELOCE") {

                    robotContainer = new createjs.Container();

                    bitmap = new createjs.Bitmap('assets/images/Veloce_Robot_Illustrated.png');
                    bitmap.scaleX = 0.042;
                    bitmap.scaleY = 0.04;

                    // bitmap.scaleX = (1.1 / (0.01108)) * image.scaleX;
                    // bitmap.scaleY = (1.8 / (0.00839787234)) * image.scaleY;

                    bitmap.regX = 358 / 2;		//move registration point to center of bitmap
                    bitmap.regY = 201 / 2;

                    bitmap.name = robots[i].id;
                    bitmap.isRobotMarker = true;

                    // console.log(bitmap);

                    robotMarker = new createjs.Shape();
                    colorLocal = [
                        "transparent",
                        "transparent",
                        "transparent",
                        "transparent",
                        "transparent",
                        "transparent",
                        "transparent",
                    ];

                    robotsColorsMap.set(robots[i].id, getRandomColor());

                    var veloceMarker = [];
                    for (var nn = 0; nn < 7; nn++) {
                        var startNode = (width / 7) * nn - 0.19;
                        veloceMarker[nn] = new createjs.Shape();

                        veloceMarker[nn].graphics
                            .beginStroke("#000")
                            .setStrokeStyle(0.05)
                            .beginFill(colorLocal[nn])
                            .drawRect(startNode, 0, width / 7, length);

                        veloceMarker[nn].regX = width / 2;
                        veloceMarker[nn].regY = length / 2;

                        veloceMarker[nn].isRobotMarker = true;
                        veloceMarker[nn].name = robots[i].id;

                        stage.addChild(veloceMarker[nn]);
                    }
                    robotMarker.NodesOnTop = veloceMarker;
                    var tempCol = robots[i].color_state + "0)";

                    robotMarker.graphics
                        .beginStroke(robotsColorsMap.get(robots[i].id))
                        .setStrokeStyle(0.3)
                        .beginFill("transparent")
                        .drawRect(0, 0, width, length);

                    robotMarker.regX = width / 2;
                    robotMarker.regY = length / 2;

                    robotContainer.addChild(bitmap, robotMarker);

                    robotPathDisplayMap.set(robots[i].id, false);
                    robotReservationDisplayMap.set(robots[i].id, false);
                } else {
                    color = robots[i].color || "lightgreen";

                    // robotMarker.graphics.beginFill(color).drawPolyStar(0, 0, 10, 3, 2, 0);

                    robotMarker = new createjs.Shape();
                    robotMarker.graphics
                        .beginStroke("#000")
                        .setStrokeStyle(0.1)
                        .beginFill(color)
                        .drawRect(0, 0, width, length);
                    robotMarker.regX = width / 2;
                    robotMarker.regY = length / 2;

                    var tempPose = transform(robots[i].pose);

                    payloadMarker = new createjs.Shape();

                    payloadMarker.graphics
                        .beginStroke("transparent")
                        .setStrokeStyle(0.1)
                        .beginFill("transparent")
                        .drawCircle(0, 0, 3);

                    payloadMarker.x = tempPose.x;
                    payloadMarker.y = tempPose.y - 15;

                    stage.addChild(payloadMarker);
                    robotPathDisplayMap.set(robots[i].id, false);
                    robotReservationDisplayMap.set(robots[i].id, false);

                    robotMarker.payload = payloadMarker;
                }


                if (robots[i].type === "VELOCE") {
                    robotMarker.shadow = new createjs.Shadow(
                        "rgba(255, 255, 255, 0)",
                        0,
                        0,
                        10
                    );

                    robotContainer.shadow = new createjs.Shadow("rgba(255, 0, 0, 0)", 0, 0, 15);

                } else {
                    robotMarker.shadow = new createjs.Shadow(
                        "rgba(0, 0, 0, 0)",
                        0,
                        0,
                        10
                    );
                }

                var localPose = transform(robots[i].pose);

                if (robots[i].type === "VELOCE") {
                    robotsMap.set(robots[i].id, robotContainer);

                    // robotMarker.y = 4;
                    robotMarker.x = -0.19;
                    robotContainer.x = localPose.x;
                    robotContainer.y = localPose.y;
                    stage.addChild(robotContainer);


                    // stage.addChild(robotMarker);
                }

                else {
                    robotsMap.set(robots[i].id, robotMarker);
                    robotMarker.x = localPose.x;
                    robotMarker.y = localPose.y;
                    stage.addChild(robotMarker);
                }

                robotMarker.name = robots[i].id;
                var html;

                if (robots[i].type === "VELOCE") {
                    html = createMenu(robots[i], robotOption.options);
                }
                else {
                    html = createMenu(robots[i], robotOption.options);
                }
                var gg = new createjs.DOMElement(html);

                var htmlGrid = createGrid(robots[i].id, 6, robots[i].payload);
                var ggGrid = new createjs.DOMElement(htmlGrid);
                var text;

                if (robots[i].type == "amr") {
                    text = new createjs.Text(robots[i].id + 1, "1px barlow", "black");
                } else if (robots[i].type == "VELOCE") {
                    text = new createjs.Text(robots[i].id, "1px barlow", "white");

                } else {
                    text = new createjs.Text(robots[i].id, "5px barlow", "black");
                }
                text.textBaseline = "alphabetic";

                if (robots[i].type === "VELOCE") {
                    text.font = "bold 5px barlow";
                    text.x = localPose.x + 20;
                    text.y = localPose.y;
                }

                else {
                    text.font = "bold 8px barlow";
                }

                text.visible = true;
                text.isRobot = true;


                text.type = robots[i].type;
                robotMarker.textId = text;
                robotMarker.textId.x = localPose.x;
                robotMarker.textId.y = localPose.y;


                if (payloadMarker) {
                    stage.addChild(payloadMarker);

                }
                stage.addChild(text);



                // console.log(localPose);
                // console.log(robotMarker.textId);

                robotMarker.text = gg;
                robotMarker.id = text;
                robotMarker.html = html;

                robotMarker.isRobotMarker = true;

                if (robotContainer) {
                    robotContainer.isRobotMarker = true;
                    robotContainer.name = robots[i].id;
                }

                robotMarker.text1 = ggGrid;
                robotMarker.id1 = text;
                robotMarker.htmlGrid = htmlGrid;

                robotMarker.isOpen = false;

                // robotMarker.on("click", function (evt) {
                //   console.log(evt);
                //   console.log(this.x,this.y)
                //   if (this.isOpen) {
                //     // this.scaleX = scaleCustom
                //     // this.scaleY = scaleCustom
                //     this.html.style.display = "none";
                //     this.htmlGrid.style.display = "none";

                //     stage.removeChild(this.text);
                //     stage.removeChild(this.text1);
                //   } else {
                //     if (evt.nativeEvent.which == 1) {
                //       stage.removeChild(this.text);
                //       // console.log("robot id", robots, ",,i", i);
                //       // console.log("marker", this.robotMarker);
                //       focusOnRobot(evt.target.name);

                //       this.text.x =
                //         this.x + canvas.getBoundingClientRect().left / stage.scaleX + 10;
                //       this.text.y =
                //         this.y + canvas.getBoundingClientRect().top / stage.scaleY;
                //       this.html.style.display = "block";

                //       this.text.scaleX = 1 / stage.scaleX;
                //       this.text.scaleY = 1 / stage.scaleY;

                //       this.text.rotation = -1 * stage.rotation;

                //       // this.text = text;
                //       stage.addChild(this.text);
                //     } else if (evt.nativeEvent.which == 3) {
                //       stage.removeChild(this.text1);

                //       focusOnRobot(evt.target.name);

                //       this.text1.x =
                //         this.x + canvas.getBoundingClientRect().left / stage.scaleX + 20;
                //       this.text1.y =
                //         this.y + canvas.getBoundingClientRect().top / stage.scaleY - 80;
                //       this.htmlGrid.style.display = "block";

                //       this.text1.scaleX = 1 / stage.scaleX;
                //       this.text1.scaleY = 1 / stage.scaleY;

                //       // this.text = text;
                //       stage.addChild(this.text1);
                //     }
                //   }

                //   this.isOpen = !this.isOpen;

                // });
            }
        }

        stage.update();
    } catch (ex) {
        console.log(ex);
    }
}


function deFocusRobotMarker(marker) { // function to remove shadow from the robot marker
    var temp = marker.text;
    temp.htmlElement.style.display = "none";
    stage.removeChild(temp);
    stage.update();
}

function focusRobotMarker(marker, id) { // function to create shadow on the clicked robot markers
    deFocusRobotMarker(marker);

    var robot = marker;
    robot.shadow.color = "red";

    var tempx, tempy;
    if (type_robot_live === "veloce") {
        tempx = robotsMap.get(id).x;
        tempy = robotsMap.get(id).y;
    }
    else {
        tempx = robot.x;
        tempy = robot.y;
    }
    var temp = robot.text;

    // temp.x = tempx - 50;
    // temp.y = tempy;

    temp.x = tempx + canvas.getBoundingClientRect().left / stage.scaleX + 10;
    temp.y = tempy + canvas.getBoundingClientRect().top / stage.scaleY;
    temp.rotation = -1 * stage.rotation;
    temp.htmlElement.style.display = "block";

    stage.addChild(temp);
    // console.log(robotsMap);

    stage.update();
}

function deFocusRobots(id, location) { // function to remove shadow from all robot markers based on id's

    // if (location !== "") {

    // 	var station = veloceStation.get(location);
    // 	// console.log(station);
    // 	station.graphics._stroke.style = "#000";
    // 	station.graphics._strokeStyle.width = 0.01;
    // }

    var robot;

    if (type_robot_live === "veloce") {
        robot = robotsMap.get(id).children[1];
    }

    else {
        robot = robotsMap.get(id);
    }

    for (let [key, value] of robotsMap.entries()) {
        // console.log("before", value.shadow);

        if (type_robot_live !== "veloce")
            value.shadow.color = "rgba(0, 0, 0, 0)";
        // value.graphics._stroke.style = "#000";
        // value.graphics._strokeStyle.width = 0.1;
    }

    var temp = robot.text;
    temp.htmlElement.style.display = "none";
    stage.removeChild(temp);
    stage.update();
}

function focusOnRobot(robotId, location) { //function to focus on robot and create shadow based on robot ids
    deFocusRobots(robotId, location);

    if (location !== "") {
        var station = veloceStation.get(location);
        station.graphics._stroke.style = "#D61A3C";
        // console.log(station);
        station.graphics._strokeStyle.width = 3.2;
    }

    var robot;
    var tempRobot;
    if (type_robot_live === "veloce") {
        robot = robotsMap.get(robotId).children[1];
        tempRobot = robotsMap.get(robotId);
    }

    else {
        robot = robotsMap.get(robotId);
        tempRobot = robot;
        robot.shadow.color = "red";
    }

    var tempx = tempRobot.x;
    var tempy = tempRobot.y;
    var temp = robot.text;

    if (type_robot_live === "zippy" || type_robot_live === "zippy10upper" || type_robot_live === "zippy10lower") {
        robot.graphics._stroke.style = "#D61A3C";
        robot.graphics._strokeStyle.width = 2;
    }

    temp.x = tempx + canvas.getBoundingClientRect().left / stage.scaleX + 10;
    temp.y = tempy + canvas.getBoundingClientRect().top / stage.scaleY;

    temp.rotation = -1 * stage.rotation;
    temp.htmlElement.style.display = "block";

    stage.addChild(temp);
    stage.update();
}

function ReturnRobotOptionsJson(robotOption, robotId, option) {
    let ob = {};
    for (let i = 0; i < robotOption.length; i++) {
        if (robotOption[i].name != option) {
            ob[robotOption[i].name] = -1;
        } else {
            ob[option] = 1;
        }
    }

    ob["robot_id"] = robotId;

    return ob;
}

function addVirtualRobot(virtualRobot, robotOption) {
    for (var i = 0; i < virtualRobot.length; i++) {
        if (robotsMap.has(virtualRobot[i].id)) {
            robotMarker = robotsMap.get(virtualRobot[i].id);
            robotMarker.visible = true;
        } else {
            var robotMarker = new createjs.Bitmap(image_robot);

            robotsMap.set(virtualRobot[i].id, robotMarker);
            robotMarker.x = virtualRobot[i].pose.position.x;
            robotMarker.y = virtualRobot[i].pose.position.y;
            robotMarker.rotation = 85;
            robotMarker.visible = true;
            robotMarker.regX = robotMarker.image.width / 2;
            robotMarker.regY = robotMarker.image.height / 2;

            robotMarker.scaleX = 0.1;
            robotMarker.scaleY = 0.1;
            robotMarker.name = virtualRobot[i].id;

            var html = createMenu(virtualRobot[i], robotOption.options);
            var gg = new createjs.DOMElement(html);

            var text = new createjs.Text(virtualRobot[i].id, "20px barlow", "#ff7700");
            text.textBaseline = "alphabetic";
            text.visible = true;
            text.scaleX = 0.5;
            text.scaleY = 0.5;

            robotMarker.id = text;
            robotMarker.text = gg;
            robotMarker.html = html;

            robotMarker.isOpen = false;
            robotMarker.on("mousedown", function (evt) {
                console.log(robotMarker);
                if (this.isOpen) {
                    this.html.style.display = "none";
                    stage.removeChild(this.text);
                } else {
                    if (evt.nativeEvent.which == 3 || true) {
                        stage.removeChild(this.text);
                        text = new createjs.DOMElement(this.html);
                        text.x = this.x + 100;
                        text.y = this.y;
                        this.html.style.display = "block";

                        this.text.scaleX = 1 / stage.scaleX;
                        this.text.scaleY = 1 / stage.scaleY;
                        this.text = text;
                        stage.addChild(text);
                    }
                }

                this.isOpen = !this.isOpen;


            });

            stage.addChild(robotMarker);
            initialiseRobotCallback(virtualRobot[i].id);
        }

        stage.update();
    }
}

var moved = false;

function initialiseRobotCallback(robotId) {
    return new Promise((resolve, reject) => {
        var position = null;
        var thetaRadians = 0;
        var thetaDegrees = 0;
        var orientationMarker = null;
        var mouseDown = false;
        var xDelta = 0;
        var yDelta = 0;
        orientationMarker = robotsMap.get(robotId);
        orientationMarker.html.style.display = "none";
        orientationMarker.isOpen = false;
        stage.removeChild(orientationMarker.text);

        stage.removeAllEventListeners();

        var mouseEventHandler = function (event, mouseState) {
            if (mouseState === "down") {
                position = computePoint1(stage.mouseX, stage.mouseY);
                mouseDown = true;
            } else if (mouseState === "move") {
                if (mouseDown === true) {
                    var currentPos = computePoint1(stage.mouseX, stage.mouseY);

                    xDelta = currentPos.x - position.x;
                    yDelta = currentPos.y - position.y;

                    thetaRadians = Math.atan2(yDelta, xDelta);

                    thetaDegrees = thetaRadians * (180.0 / Math.PI);

                    orientationMarker.x = position.x;
                    orientationMarker.y = position.y;
                    orientationMarker.rotation = thetaDegrees;

                    // stage.addChild(orientationMarker);
                }
            } else if (mouseDown) {
                mouseDown = false;

                var goalPos = new createjs.Point(stage.mouseX, stage.mouseY);

                xDelta = goalPos.x - position.x;
                yDelta = goalPos.y - position.y;

                thetaRadians = Math.atan2(xDelta, yDelta);

                if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
                    thetaRadians += (3 * Math.PI) / 2;
                } else {
                    thetaRadians -= Math.PI / 2;
                }

                var qz = Math.sin(-thetaRadians / 2.0);
                var qw = Math.cos(-thetaRadians / 2.0);

                var r_pose = reverseTransform(position.x, position.y, 0);
                var obj = {
                    id: robotId,
                    pose: {
                        position: {
                            x: r_pose.x,
                            y: r_pose.y,
                            z: 0,
                        },
                        orientation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1,
                        },
                    },
                };

                mqttServicePointer.initialiseRobot(obj).subscribe(
                    (res) => {
                        console.log("japesh");
                    },
                    (err) => {
                        console.log(err);
                    }
                );

                stage.removeAllEventListeners();
                enablePan();
                resolve();
            }
            //return pose;
        };

        stage.addEventListener("stagemousedown", function (event) {
            mouseEventHandler(event, "down");
        });

        stage.addEventListener("stagemousemove", function (event) {
            mouseEventHandler(event, "move");
        });

        stage.addEventListener("stagemouseup", function (event) {
            mouseEventHandler(event, "up");
        });
    });
}


/**************************************************/
/*             Menu related functions             */
/**************************************************/


function removeAllMenu() { // removes all the menu from thencanvas
    for (const [key, value] of robotsMap.entries()) {
        try {
            value.isOpen = false;
            value.html.style.display = "none";
            value.htmlGrid.style.display = "none";
            stage.removeChild(value.text);
            stage.removeChild(value.text1);
            stage.update();
        }
        catch (err) {
            try {
                value.children[1].isOpen = false;
                value.children[1].html.style.display = "none";
                value.children[1].htmlGrid.style.display = "none";
                stage.removeChild(value.children[1].text);
                stage.removeChild(value.children[1].text1);
                stage.update();
            }
            catch (err1) {

            }
        }

    }
}

//! not used for now
function createGrid(robotId, size, payload) { //creates payload menu
    var parent = document.createElement("div");

    var row = document.createElement("div");
    row.className = "row_class";

    if (payload) {
        for (var j = 0; j < payload.length; j++) {
            // console.log(payload[j], "j");
            var box = document.createElement("div");
            box.className = "row";
            if (payload[j] != 0) {
                box.innerHTML = `<span style="font-size:40px">&middot</span>`;
                box.style.color = "green";
            } else {
                box.innerHTML = `<span style="font-size:40px">&middot</span>`;
                box.style.color = "red";
            }
            box.style.fontWeight = "550";
            box.style.padding = "5px";

            box.style.width = "5px";
            box.style.height = "10px";
            box.style.marginTop = "5px";

            row.appendChild(box);
        }
    }
    // parent.style.

    var btn = document.createElement("div");
    btn.className = "row";
    btn.innerHTML = `<i class="fas fa-times"></i> &nbsp;`;
    // btn.style.border = "none";
    // btn.style.position = "absolute";
    // btn.style.top = "-10px";
    // btn.style.right = "-30px";
    btn.style.backgroundColor = "transparent";
    btn.style.marginTop = "14px";
    btn.style.paddingLeft = "6px";
    btn.style.cursor = "pointer";

    btn.onclick = function () {
        var removeText = robotsMap.get(robotId);
        removeText.htmlGrid.style.display = "none";
        removeText.isOpen = false;
        stage.removeChild(removeText.text1);
        deFocusRobots(robotId);
    };

    row.appendChild(btn);

    parent.appendChild(row);

    var html = document.createElement("div");
    html.id = robotId;
    // html.className += "robotsAction";
    // html.style.height = '50px';
    // html.style.width = '100px';
    html.style.backgroundColor = "rgba(255,255,255/89%)";
    html.style.position = "relative";
    html.style.position = "absolute";
    html.style.top = 0;
    html.style.left = 0;
    html.style.display = "none";
    html.style.textAlign = "center";
    html.style.paddingTop = "5px";

    html.appendChild(parent);

    document.body.appendChild(html);

    return html;
}



function createMenu(robots, robotOption) { // function to create robot options menu
    var resp = {};

    var ul = document.createElement("ul");
    ul.style.listStyleType = "none";
    ul.style.paddingLeft = "0rem";
    ul.style.textAlign = "left";
    ul.className += "actionList";

    let optionLength = Object.keys(robotOption).length;

    //?test generalisation

    for (let i = 0; i < robotOption.length; i++) {
        switch (robotOption[i].name) {
            case "Initializing":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-play"></i>&nbsp; Initialise`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    if (robots.type === "amr") {
                        initialiseRobotCallback(robots.id);
                    }

                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe((res) => {
                                console.log("Done");
                            });
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Show Station":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-gas-pump"></i>&nbsp; Show/Hide Station`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    var removeText = robotsMap.get(robots.id);
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Show_path":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-road-circle-check"></i>&nbsp; Show/Hide Paths`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    var temp = robotPathDisplayMap.get(robots.id);

                    if (temp) {
                        clearRobotPath(robots.id);
                    }
                    robotPathDisplayMap.set(robots.id, !temp);
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;


            case "Cancel_Task":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-ban"></i>&nbsp; Cancel Task`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    resp = {};
                    resp = ReturnRobotOptionsJson(
                        robotOption,
                        robots.id,
                        robotOption[i].name
                    );

                    restServicePointer
                        .acknowledgeOption(robotOption[i].endpoint, resp)
                        .subscribe(
                            (res) => {
                                console.log("Done");
                            },
                            (err) => {
                                console.log(err);
                            }
                        );

                    var removeText = robotsMap.get(robots.id);
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Enable":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-circle-play"></i>&nbsp; Enable`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {

                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }
                    else {

                        var obj = {
                            robotId: robots.id,
                            enable: 1,
                        };

                        restServicePointer.enableRobot(obj).subscribe(res => {
                            snackBarPointer.openSnackBar(res.messageText, "close");
                        });
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Disable":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-circle-stop"></i>&nbsp; Disable`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {

                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }
                    else {

                        var obj = {
                            robotId: robots.id,
                            enable: 0,
                        };

                        restServicePointer.enableRobot(obj).subscribe(res => {
                            snackBarPointer.openSnackBar(res.messageText, "close");
                        });
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }

                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Remove_Reserve":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-minus"></i>&nbsp; Remove Reserve`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    console.log(robots);
                    if (robots.type === "amr") {
                        var obj = {
                            robotId: robots.id,
                        };
                        restServicePointer
                            .sendRobotAction(robotOption[i].endpoint, obj)
                            .subscribe((res) => {
                                console.log(res);
                            }),
                            (err) => {
                                console.log(err);
                            };
                    } else if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Add_Reserve":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-plus"></i>&nbsp; Add Reserve`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    console.log(robots);
                    if (robots.type === "amr") {
                        var obj = {
                            robotId: robots.id,
                        };
                        restServicePointer
                            .sendRobotAction(robotOption[i].endpoint, obj)
                            .subscribe((res) => {
                                console.log(res);
                            }),
                            (err) => {
                                console.log(err);
                            };
                    } else {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Finish_charge":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-charging-station"></i>&nbsp; Finish Charging`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    console.log(robots);
                    if (robots.type === "amr") {
                        var obj = {
                            robotId: robots.id,
                        };
                        restServicePointer
                            .sendRobotAction(robotOption[i].endpoint, obj)
                            .subscribe((res) => {
                                console.log(res);
                            }),
                            (err) => {
                                console.log(err);
                            };
                    } else {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Retry_action":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-rotate-right"></i>&nbsp; Retry Action`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    console.log(robots);
                    if (robots.type === "amr") {
                        var obj = {
                            robotId: robots.id,
                        };
                        restServicePointer
                            .sendRobotAction(robotOption[i].endpoint, obj)
                            .subscribe((res) => {
                                console.log(res);
                            }),
                            (err) => {
                                console.log(err);
                            };
                    } else {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Vpl":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-code"></i>&nbsp; Vpl`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    var url = robotOption[i].endpoint + robots.id;

                    window.location.href = url;

                    var removeText = robotsMap.get(robots.id);
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Estop":
                var li = document.createElement("li");
                var btn = document.createElement("button");

                btn.innerHTML = `<i class="far fa-stop-circle"></i> &nbsp; Estop`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText = robotsMap.get(robots.id);
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Deinitializing":
                var li = document.createElement("li");

                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-pause"></i>&nbsp; Deinitialise`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log("Done");
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "Reservations":
                var li = document.createElement("li");

                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-qrcode"></i>&nbsp; Reservations`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    if (robots.type === "zippy") {
                        resp = {};
                        resp = ReturnRobotOptionsJson(
                            robotOption,
                            robots.id,
                            robotOption[i].name
                        );

                        restServicePointer
                            .acknowledgeOption(robotOption[i].endpoint, resp)
                            .subscribe(
                                (res) => {
                                    console.log(res);
                                    drawReservation(res);
                                    // clearReservation();
                                    setTimeout(clearReservation, 10000);
                                    // clearInterval(timer);
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "clear_reservation":
                var li = document.createElement("li");

                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-bell-slash"></i> &nbsp; Clear Reservation `;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    var obj = {
                        robot_id: robots.id
                    };
                    restServicePointer.clearVeloceReservation(obj).subscribe(res => {
                        snackBarPointer.openSnackBar(
                            `Reservation Cleared for ${robots.id}`,
                            "Close"
                        );
                    });


                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;

            case "show_payload":
                var li = document.createElement("li");

                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fa-solid fa-location-dot"></i> &nbsp; Show Payload`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.onclick = function () {
                    var obj = {
                        robot_id: robots.id
                    };

                    restServicePointer
                        .getPayloadPoints(obj)
                        .subscribe(
                            (res) => {
                                // console.log(res);
                                drawPayload(res.tasks, robots.id);
                                // clearReservation();
                                setTimeout(clearPayload, 10000, robots.id);
                                // clearInterval(timer);
                            },
                            (err) => {
                                console.log(err);
                            }
                        );

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;



            case "robotui":
                var li = document.createElement("li");

                var btn = document.createElement("button");

                btn.innerHTML = `<i class="fas fa-at" ></i> &nbsp; Robot UI`;
                btn.style.border = "none";
                btn.style.margin = "2%";
                btn.style.lineHeight = "1.8em";
                btn.classList.add("mat-button");
                btn.title = "Robot UI";

                // <meter class="col-8" value={{robot.battery}} max="100" optimum="50" min="0" low="30"></meter>

                btn.onclick = function () {

                    var encryptedData;
                    if (type_robot_live === "amr" || type_robot_live === "veloce") {
                        encryptedData = _cryptoService.encrypData({
                            key: "japesh",
                            id: robots.id,
                        });
                    }

                    else {
                        encryptedData = _cryptoService.encrypData({
                            key: "japesh",
                            id: robots.id,
                            ip: robots.robotName
                        });
                    }
                    // console.log(robotOption[i].endpoint + encryptedData)
                    // window.location.href = "http://localhost:300?japesh";
                    // console.log(robots.robotName.split(" "));
                    window.open(robotOption[i].endpoint + encryptedData);

                    //? testing for iframe
                    // document.getElementById("myFrame").src = robotOption[i].endpoint;

                    // document.getElementById("myFrame").classList.remove("iframe-hide");
                    // document.getElementById("myFrame").classList.add("iframe-show");

                    // document.getElementById("canvas-row").classList.add("iframe-hide");

                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                };
                li.appendChild(btn);
                ul.appendChild(li);
                break;

            default:
                var li = document.createElement("li");
                var btn = document.createElement("button");
                btn.innerHTML = `<i class="fas fa-times"></i> &nbsp;`;
                btn.style.border = "none";
                btn.style.position = "absolute";
                btn.style.top = "-5px";
                btn.style.right = "-10px";
                btn.style.backgroundColor = "white";

                btn.onclick = function () {
                    var removeText;
                    if (robots.type === "VELOCE") {
                        removeText = robotsMap.get(robots.id).children[1];
                    }
                    else {
                        removeText = robotsMap.get(robots.id);
                    }
                    removeText.html.style.display = "none";
                    removeText.isOpen = false;
                    deFocusRobots(robots.id, '');
                    stage.removeChild(removeText.text);
                    // stage.removeChild()
                };

                li.appendChild(btn);
                ul.appendChild(li);
                break;
        }
    }

    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.innerHTML = `<i class="fas fa-times"></i> &nbsp;`;
    btn.style.border = "none";
    btn.style.position = "absolute";
    btn.style.top = "-5px";
    btn.style.right = "-10px";
    btn.style.backgroundColor = "white";

    btn.onclick = function () {
        var removeText;
        if (robots.type === "VELOCE") {
            removeText = robotsMap.get(robots.id).children[1];
        }
        else {
            removeText = robotsMap.get(robots.id);
        }

        removeText.html.style.display = "none";
        removeText.isOpen = false;
        stage.removeChild(removeText.text);
        deFocusRobots(robots.id);
        // stage.removeChild()
    };

    li.appendChild(btn);
    ul.appendChild(li);

    var para = document.createElement("p");

    var node = document.createTextNode(robots.view_name);
    // var node = document.createTextNode("Work Hours: 9 Hours");

    para.appendChild(node);

    var hrElement = document.createElement("hr");

    var html = document.createElement("div");
    html.id = robots.id;
    html.className += "robotsAction";

    html.style.backgroundColor = "rgb(255 255 255 / 71%)";
    html.style.position = "relative";

    html.style.top = 0;
    html.style.left = 0;
    html.style.display = "none";
    html.style.textAlign = "center";
    html.style.paddingTop = "15px";

    var p = document.createElement("p");
    p.innerHTML = `Battery : ${robots.battery.toFixed(2)}%`;
    p.style.fontSize = "12px";
    p.style.fontWeight = "600";
    // p.style.marginLeft = "15px";
    p.style.marginBottom = "0px";

    // console.log(robots)

    var task = document.createElement("p");
    task.innerHTML = `Task : ${robots.current_task}`;
    task.style.fontSize = "12px";
    task.style.fontWeight = "600";

    var bat = document.createElement("meter");
    bat.value = robots.battery / 100;

    bat.style.width = "80%";
    bat.style.marginTop = "-10px";

    html.appendChild(para);
    html.appendChild(p);
    html.appendChild(bat);
    html.appendChild(task);

    html.appendChild(ul);

    document.body.appendChild(html);

    return html;
}



/***************************************************/
/*    NodeGraph related functions and variables    */
/***************************************************/

function getCordinates(dontPan) { // function to get coordinates of the point clicked
    return new Promise((resolve, reject) => {
        var position = null;
        var thetaRadians = 0;
        var thetaDegrees = 0;
        var mouseDown = false;
        var xDelta = 0;
        var yDelta = 0;

        stage.removeAllEventListeners();

        var mouseEventHandler = function (event, mouseState) {
            if (mouseState === "down") {
                position = computePoint1(stage.mouseX, stage.mouseY);

                mouseDown = true;
            } else if (mouseState === "move") {
                if (mouseDown === true) {
                    var currentPos = computePoint1(stage.mouseX, stage.mouseY);
                    xDelta = currentPos.x - position.x;
                    yDelta = currentPos.y - position.y;
                    thetaRadians = Math.atan2(yDelta, xDelta);
                    thetaDegrees = thetaRadians * (180.0 / Math.PI);
                }
            } else if (mouseDown) {
                mouseDown = false;

                var goalPos = new createjs.Point(stage.mouseX, stage.mouseY);

                xDelta = goalPos.x - position.x;
                yDelta = goalPos.y - position.y;

                thetaRadians = Math.atan2(xDelta, yDelta);

                if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
                    thetaRadians += (3 * Math.PI) / 2;
                } else {
                    thetaRadians -= Math.PI / 2;
                }

                var qz = Math.sin(-thetaRadians / 2.0);
                var qw = Math.cos(-thetaRadians / 2.0);

                var pos = {
                    position: {
                        x: position.x,
                        y: position.y,
                        z: 0,
                    },
                };

                var poseObj = {
                    pose: {
                        position: {
                            x: position.x,
                            y: position.y,
                            z: 0,
                        },
                        orientation: {
                            x: 0,
                            y: 0,
                            z: qz,
                            w: qw,
                        },
                    },
                };
                stage.removeAllEventListeners();

                // enablePan()
                resolve(poseObj);
            }
            //return pose;
        };

        stage.addEventListener("stagemousedown", function (event) {
            mouseEventHandler(event, "down");
        });

        stage.addEventListener("stagemousemove", function (event) {
            mouseEventHandler(event, "move");
        });

        stage.addEventListener("stagemouseup", function (event) {
            mouseEventHandler(event, "up");
        });
    });
}

function allowDeleteObjects(data) {
    deleteAllowedNodes = data;
}

// get the Nodegraph data and return the resolved object 
function getDataGraph() {
    return new Promise((resolve, reject) => {
        let obj = {
            nodes: nodesPointArray,
            edges: edgesForFms,
        };

        resolve(obj);
    });
}

function setDelete(t) { // set Delete variable
    isDelete = t;
}

// ? This function is used to create the nodes from the retrieved graph
function createNodeonly(nod) {
    orientationMarker = new createjs.Shape();
    var color = "rgba(255, 0, 0,.8)";
    orientationMarker.graphics
        .setStrokeStyle(500, "round", "round")
        .beginFill(color)
        .drawCircle(0, 0, 3);

    var text = new createjs.Text(
        nod.name + " ; " + nod.type,
        "1px barlow",
        "#000000"
    );
    text.textBaseline = "alphabetic";
    text.visible = true;
    text.scaleX = 0.5;
    text.scaleY = 0.5;
    orientationMarker.text = text;

    var transformPos = transform(nod.pose);

    orientationMarker.x = transformPos.x;
    orientationMarker.y = transformPos.y;
    orientationMarker.text.x = transformPos.x;
    orientationMarker.text.y = transformPos.y;
    stage.addChild(orientationMarker);

    stage.addChild(text);

    var tempPos = {
        position: {
            x: transformPos.x,
            y: transformPos.y,
            z: transformPos.z,
        },
    };


    orientationMarker.visible = true;
    var nodeObjFms = {
        name: nod.name,
        type: nod.type,
        pose: tempPos,
    };

    // console.log(i, nodeObjFms);

    orientationMarker.name = nod.name;

    NodeMap.set(nodeObjFms.name, nodeObjFms);
    nodesPointArray.push(nodeObjFms);

    graphCanvasArr.push(orientationMarker);

    // orientationMarker.on("mousedown", function (evt) {
    //   for (var jj = 0; jj < edgesForFms.length; jj++) {
    //     if (this.name == edgesForFms[jj].name) {
    //       edgeMap.delete(this.name);
    //       this.graphics.clear();
    //       edgesForFms.splice(jj, 1);
    //       jj--;
    //       break;
    //       // console.log(EditMapObjectOrignal)
    //     }
    //   }

    //   if (isDelete) {
    //     for (var jj = 0; jj < nodesPointArray.length; jj++) {
    //       if (this.name == nodesPointArray[jj].name) {
    //         var kk = 0;
    //         while (kk < graphCanvasArr.length) {
    //           // console.log(kk)
    //           if (
    //             graphCanvasArr[kk].text == this.text ||
    //             graphCanvasArr[kk] == this
    //           ) {
    //             graphCanvasArr.splice(kk, 1);
    //             kk--;
    //           }
    //           kk++;
    //         }
    //         // console.log(this)
    //         stage.removeChild(this.text);
    //         stage.removeChild(this);

    //         this.graphics.clear();
    //         nodesPointArray.splice(jj, 1);
    //         jj--;

    //         break;
    //       }
    //     }

    //     for (var ii = 0; ii < edgesForFms.length; ii++) {
    //       if (
    //         this.name == edgesForFms[ii].to ||
    //         this.name == edgesForFms[ii].from
    //       ) {
    //         var temp = edgesForFms[ii].name;

    //         var tempChild = stage.getChildByName(temp);
    //         stage.removeChild(tempChild);

    //         edgeMap.delete(temp);

    //         this.graphics.clear();

    //         edgesForFms.splice(ii, 1);
    //         ii--;
    //       }
    //     }

    //     update = true;
    //   }
    //   console.log("akhil", createEdge);
    //   if (createEdge && !isDelete) {
    //     drawEdge({
    //       x: nod.pose.position.x,
    //       y: nod.pose.position.y,
    //       name: nod.name,
    //     });
    //   }
    // });

    stage.removeAllEventListeners();
    enablePan();
}

// create the node for the nodegraph
function createNode(obj) {
    return new Promise((resolve, reject) => {
        // console.log("herrr");
        for (let i = 0; i < obj.nodes.length; i++) {
            createNodeonly(obj.nodes[i]);
        }

        resolve();
    });
}

// ? This function is used to create the edges from the retrieved graph
function createEdgeOnly(ed) {
    // console.log(ed);
    if (ed.isUniDirectional) {
        color = "rgba(99, 128, 255,.3)";
    } else {
        color = "rgba(239, 142, 63,.6)";
    }
    // stage.removeAllEventListeners();

    edgesForFms.push(ed);

    var currentNode = NodeMap.get(ed.from);

    // findCurrentNode(ed.from);
    var finalNode = NodeMap.get(ed.to);

    var drawingCanvas = new createjs.Shape();
    stage.addChild(drawingCanvas);

    edgeDrawingBoolean = true;

    var oldPt = new createjs.Point(
        currentNode.pose.position.x,
        currentNode.pose.position.y
    );
    var finalPt = new createjs.Point(
        finalNode.pose.position.x,
        finalNode.pose.position.y
    );

    drawingCanvas.graphics
        .clear()
        .setStrokeStyle(2, "round", "round")
        .beginStroke(color)
        .moveTo(finalPt.x, finalPt.y)
        .lineTo(oldPt.x, oldPt.y);

    var midPointLocal = {
        y: 0.5 * (finalPt.y + oldPt.y),
        x: 0.5 * (finalPt.x + oldPt.x),
    };

    var localAngle =
        (Math.atan((finalPt.y - oldPt.y) / (finalPt.x - oldPt.x)) * 180) / Math.PI;

    if (finalPt.x - oldPt.x < 0) {
        localAngle = localAngle - 180;
    }

    // console.log(localAngle);

    if (ed.isUniDirectional) {
        drawingCanvas.graphics
            .beginFill(color)
            .drawPolyStar(midPointLocal.x, midPointLocal.y, 3, 3, 0.6, localAngle);
    }

    edgeDrawingBoolean = false;
    ObjectToBeSaved = null;
    drawingCanvas.name = ed.name;
    graphCanvasArr.push(drawingCanvas);

    edgeDrawingBoolean = true;

    stage.addEventListener("pressmove", function (event) {
        handleMouseMoveRe(event);
    });

    stage.addEventListener("stagemouseup", function (event) {
        handleMouseUpRe(event);
    });

    function handleMouseMoveRe(event) {
        if (!event.primary) {
            return;
        }

        var midPt = computePoint1(stage.mouseX, stage.mouseY);
        finalPt.x = midPt.x;
        finalPt.y = midPt.y;

        drawingCanvas.graphics
            .clear()
            .setStrokeStyle(2, "round", "round")
            .beginStroke(color)
            .moveTo(finalPt.x, finalPt.y)
            .lineTo(oldPt.x, oldPt.y);

        // stage.update();
    }

    function handleMouseUpRe(event) {
        if (!event.primary) {
            return;
        }
    }
    drawingCanvas.on("mousedown", function (evt) {
        if (isDelete) {
            for (var jj = 0; jj < edgesForFms.length; jj++) {
                if (this.name == edgesForFms[jj].name) {
                    console.log(this);
                    edgeMap.delete(this.name);
                    this.graphics.clear();
                    edgesForFms.splice(jj, 1);
                    jj--;
                    break;
                    // console.log(EditMapObjectOrignal)
                }
            }
            update = true;
        }
    });
    stage.removeAllEventListeners();

    enablePan();
}

// create the edges from the received data of nodegraph 
function createNewGraphEdges(obj) {

    return new Promise((resolve, reject) => {
        // console.log("herrr");
        for (let i = 0; i < obj.edges.length; i++) {
            createEdgeOnly(obj.edges[i]);
        }
        resolve();
    });

    // var iter = 0;
    // var EdgInterval = setInterval(function () {
    // 	if (iter < obj.edges.length) {
    // 		for (let i = 0; i < 50; i++) {
    // 			createEdgeOnly(obj.edges[iter++]);

    // 			// createEdgeOnly(obj.edges[i]);
    // 		}
    // 	} else {
    // 		clearInterval(EdgInterval);
    // 	}
    // }, 1);
    //
}


// function that would redraw the nodegraph after hitting the api 
function reDrawNodeGraph(obj) {
    createNode(obj).then((res) => {
        createNewGraphEdges(obj);
    });

    stage.update();

    //! test edits
}

//function to clear the graph related markers
function clearGraph() {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < graphCanvasArr.length; i++) {
            stage.removeChild(graphCanvasArr[i]);
            if (graphCanvasArr[i].text) {
                stage.removeChild(graphCanvasArr[i].text);
            }
        }

        graphCanvasArr = [];
        nodesPointArray = [];
        edgesForFms = [];

        resolve();
    });
}

//function to toggle between the type of edges
function setDirectionType(direction) {
    if (direction === "uni") isUniDirectional = true;

    if (direction == "bi") isUniDirectional = false;
}


// function to draw node in creation mode
function drawNodesForFmsRos(nodeObjectCust) {
    return new Promise((resolve, reject) => {
        stage.removeAllEventListeners();

        var customName = nodeObjectCust.name;
        var custType = nodeObjectCust.type;
        var color = "rgba(255, 0, 0,.8)";
        var direction = nodeObjectCust.direction;

        getCordinates().then((res) => {
            console.log(res);

            orientationMarker = new createjs.Shape();

            orientationMarker.graphics
                .setStrokeStyle(500, "round", "round")
                .beginFill(color)
                .drawCircle(0, 0, 6);

            var text = new createjs.Text(
                customName + " ; " + custType,
                "18px barlow",
                "#000000"
            );
            text.textBaseline = "alphabetic";
            text.visible = true;
            text.scaleX = 0.5;
            text.scaleY = 0.5;
            orientationMarker.text = text;

            orientationMarker.x = res.pose.position.x;
            orientationMarker.y = res.pose.position.y;
            orientationMarker.text.x = res.pose.position.x;
            orientationMarker.text.y = res.pose.position.y;
            stage.addChild(orientationMarker);

            stage.addChild(text);

            stage.update();

            orientationMarker.visible = true;
            var nodeObjFms = {
                name: customName,
                type: custType,
                pose: res.pose,
            };
            orientationMarker.name = customName;
            nodesPointArray.push(nodeObjFms);

            // console.log("Akhil node", nodesPointArray);
            graphCanvasArr.push(orientationMarker);

            orientationMarker.on("mousedown", function (evt) {
                // console.log("m,m,", isDelete);

                // console.log(this.text)

                if (isDelete) {
                    for (var jj = 0; jj < nodesPointArray.length; jj++) {
                        // console.log(this.name == nodesPointArray[jj].name,nodesPointArray[jj].name,this.name )
                        if (this.name == nodesPointArray[jj].name) {
                            var kk = 0;
                            while (kk < graphCanvasArr.length) {
                                if (
                                    graphCanvasArr[kk].text == this.text ||
                                    graphCanvasArr[kk] == this
                                ) {
                                    graphCanvasArr.splice(kk, 1);
                                    kk--;
                                }
                                kk++;
                            }
                            // console.log(this)
                            stage.removeChild(this.text);
                            stage.removeChild(this);

                            this.graphics.clear();
                            nodesPointArray.splice(jj, 1);
                            jj--;
                            break;
                            // console.log(EditMapObjectOrignal)
                        }
                    }

                    for (var ii = 0; ii < edgesForFms.length; ii++) {
                        //console.log(ii, "--", edgesForFms[ii]);

                        if (
                            this.name == edgesForFms[ii].to ||
                            this.name == edgesForFms[ii].from
                        ) {
                            var temp = edgesForFms[ii].name;
                            //console.log(temp, "ssas");

                            var tempChild = stage.getChildByName(temp);
                            stage.removeChild(tempChild);

                            edgeMap.delete(temp);

                            console.log(this.graphics);
                            this.graphics.clear();

                            edgesForFms.splice(ii, 1);
                            ii--;
                        }
                    }

                    update = true;
                }

                if (createEdge && !isDelete) {
                    drawEdge({
                        x: res.pose.position.x,
                        y: res.pose.position.y,
                        name: this.name,
                    });
                }
            });

            stage.removeAllEventListeners();
            enablePan();
            resolve();
        });
    });
}


// function the current node from the array
function findCurrentNode(name) {
    for (var i = 0; i < nodesPointArray.length; i++) {
        var currentNode = nodesPointArray[i];

        if (name == currentNode.name) {
            // and condition

            return nodesPointArray[i];
        }
    }
    return nodesPointArray[0];
}

//find the nearest node form the release point of the mouse when drawing edge
function findTheNearestNode(x, y, name) {
    var dist = 10000000;
    ans = nodesPointArray[0].pose;
    console.log(x, y);

    // x = rev_pos.x;
    // y = rev_pos.y;

    for (var i = 0; i < nodesPointArray.length; i++) {
        var currentNode = nodesPointArray[i];

        if (currentNode.name != name) {
            var localDist = Math.sqrt(
                Math.pow(1 * x - 1 * currentNode.pose.position.x, 2) +
                Math.pow(1 * y - 1 * currentNode.pose.position.y, 2)
            );

            if (localDist < dist) {
                // and condition

                ans = currentNode;
                dist = localDist;
            }
        }
    }
    if (name == ans.name) {
        return false;
    }
    return ans;
}

//funtion to draw edges between two nodes
function drawEdge(options) {
    // console.log(options);

    if (isUniDirectional) {
        color = "rgba(99, 128, 255,.3)";
    } else {
        color = "rgba(239, 142, 63,.6)";
    }
    stage.removeAllEventListeners();

    var currentNode = findCurrentNode(options.name);

    var drawingCanvas = new createjs.Shape();
    stage.addChild(drawingCanvas);

    //Update stage will render next frame
    stage.update();

    var oldPt = new createjs.Point(
        currentNode.pose.position.x,
        currentNode.pose.position.y
    );
    var finalPt = new createjs.Point(
        currentNode.pose.position.x,
        currentNode.pose.position.y
    );

    edgeDrawingBoolean = true;

    stage.addEventListener("pressmove", function (event) {
        handleMouseMove(event);
    });
    stage.addEventListener("stagemouseup", function (event) {
        handleMouseUp(event);
    });

    function handleMouseMove(event) {
        if (!event.primary) {
            return;
        }

        var midPt = computePoint1(stage.mouseX, stage.mouseY);
        finalPt.x = midPt.x;
        finalPt.y = midPt.y;

        drawingCanvas.graphics
            .clear()
            .setStrokeStyle(2, "round", "round")
            .beginStroke(color)
            .moveTo(finalPt.x, finalPt.y)
            .lineTo(oldPt.x, oldPt.y);

        stage.update();
    }

    function handleMouseUp(event) {
        if (!event.primary) {
            return;
        }

        finalPt.x = stage.mouseX;
        finalPt.y = stage.mouseY;

        var curPos = computePoint1(finalPt.x, finalPt.y);
        drawingCanvas.graphics.endStroke();

        var finalNodeCust = findTheNearestNode(curPos.x, curPos.y, options.name);

        if (!finalNodeCust) {
            drawingCanvas.graphics.clear();
            stage.removeAllEventListeners();
            return;
        }
        console.log(finalNodeCust);
        var finalPose = new createjs.Point(
            finalNodeCust.pose.position.x,
            finalNodeCust.pose.position.y
        );

        var edgeParent = options.name.split(";", 10);
        var edgeChild = finalNodeCust.name.split(";", 10);
        var edgeResult = {
            name: edgeParent[0].trim() + "|" + edgeChild[0].trim(),
            from: options.name,
            to: finalNodeCust.name,
            isUniDirectional: isUniDirectional,
        };

        if (
            edgeMap.has(edgeResult.name) ||
            edgeMap.has(edgeChild[0].trim() + "|" + edgeParent[0].trim())
        ) {
            drawingCanvas.graphics.clear();
            stage.removeAllEventListeners();
        } else {
            edgeMap.set(edgeResult.name, edgeResult);
            console.log(edgeMap);

            drawingCanvas.graphics
                .clear()
                .setStrokeStyle(2, "round", "round")
                .beginStroke(color)
                .moveTo(finalPose.x, finalPose.y)
                .lineTo(oldPt.x, oldPt.y);

            var localAngle =
                (Math.atan((finalPose.y - oldPt.y) / (finalPose.x - oldPt.x)) * 180) /
                Math.PI;
            if (finalPose.x - oldPt.x < 0) {
                localAngle = localAngle - 180;
            }
            var midPointLocal = {
                y: 0.5 * (finalPose.y + oldPt.y),
                x: 0.5 * (finalPose.x + oldPt.x),
            };
            console.log(midPointLocal);

            if (isUniDirectional) {
                drawingCanvas.graphics
                    .beginFill(color)
                    .drawPolyStar(
                        midPointLocal.x,
                        midPointLocal.y,
                        6,
                        3,
                        0.6,
                        localAngle
                    );
            }

            edgesForFms.push(edgeResult);
            edgeDrawingBoolean = false;
            ObjectToBeSaved = null;
            drawingCanvas.name = edgeResult.name;
            graphCanvasArr.push(drawingCanvas);
            drawingCanvas.on("mousedown", function (evt) {
                if (isDelete) {
                    for (var jj = 0; jj < edgesForFms.length; jj++) {
                        if (this.name == edgesForFms[jj].name) {
                            // console.log(this)
                            edgeMap.delete(this.name);
                            this.graphics.clear();
                            edgesForFms.splice(jj, 1);
                            jj--;
                            break;
                            // console.log(EditMapObjectOrignal)
                        }
                    }
                    update = true;
                }
            });
            stage.removeAllEventListeners();
        }
        enablePan();
    }
}
