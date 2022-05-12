

var socket_id = 0;
var exp_id = 0;
var updateSource;
var updateSource2;
var updateSource3;
var canCallStaticLayer = Boolean(false);
var staticLayerCalled = Boolean(false);

//VISUALIZATION
var show3DBuilding = Boolean(false);

//SOCKET
var launchSocket = new WebSocket("ws://localhost:6868/");
// launchSocket.binaryType = "arraybuffer";
// var outputSocket = new WebSocket("ws://localhost:6868/");

//GAMA PATH
var ABSOLUTE_PATH_TO_GAMA = 'C:\\git\\';
var modelPath = ABSOLUTE_PATH_TO_GAMA + 'gama/msi.gama.models/models/Tutorials/Road Traffic/models/Model 05.gaml';
var experimentName = 'road_traffic';
var species1Name = 'people';
var attribute1Name = 'objective';
var species2Name = 'building';
var attribute2Name = 'type';

var queue = [];
var req = "";
var result = "";
var updateSource = setInterval(() => {
	if (queue.length > 0 && req === "") {
		req = queue.shift();
		req.exp_id = exp_id;
		req.socket_id = socket_id;
		launchSocket.send(JSON.stringify(req));
		log("request " + JSON.stringify(req));
		launchSocket.onmessage = function (event) {
			msg = event.data;
			if (event.data instanceof Blob) { } else {
				if (req.callback) {
					req.callback(msg);
				} else {
					req = "";
				}
				// log(msg);	
				// result = JSON.parse(msg);
				// if (result.exp_id) exp_id = result.exp_id;
				// if (result.socket_id) socket_id = result.socket_id; 
			}
		}
	}

}, 1);
launchSocket.onclose = function (event) {
	clearInterval(updateSource);
};
function onReceiveMsg(e) {
	log(e);
	req = "";
}
launchSocket.addEventListener('open', (event) => {
	var cmd = {
		"type": "launch",
		"model": modelPath,
		"experiment": experimentName,
		"parameters": [
			{ "name": "Number of people agents", "value": "500", "type": "int" },
			{ "name": "Value of destruction when a people agent takes a road", "value": "0.2", "type": "float" }
		],
		"auto-export": false,
		"callback": function (e) {
			log(e);
			result = JSON.parse(msg);
			if (result.exp_id) exp_id = result.exp_id;
			if (result.socket_id) socket_id = result.socket_id;
			req = "";
		}

	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		// "expr": '"{\"lat\":"+(CRS_transform(world.shape,"EPSG:4326").location.x)+",\"lon\":"+(CRS_transform(world.shape,"EPSG:4326").location.y)+"}"',
		"expr": "CRS_transform(world.shape,\"EPSG:4326\").location",
		"callback": function (ee) {
			ee = JSON.parse(ee).result.replace(/[{}]/g, "");
			var eee = ee.split(",");
			log(eee[0]);
			log(eee[1]);
			req = "";
		}
	};
	queue.push(cmd);
	cmd = {
		"type": "play",
		"socket_id": socket_id,
		"exp_id": exp_id
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "length(people)",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "ask 10 among people{do die;}",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "length(people)",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "create people number:100;",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "length(people)",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "dead(simulation)",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
	cmd = {
		"type": "expression",
		"socket_id": socket_id,
		"exp_id": exp_id,
		"expr": "cycle",
		"callback": onReceiveMsg
	};
	queue.push(cmd);
});


function log(e) {
	document.write(e);
	document.write("</br>");
	document.write("------------------------------");
	document.write("</br>");
}