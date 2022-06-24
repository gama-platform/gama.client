

var geojsonMap = new Map();
var updateSource;
//GAMA PATH
var ABSOLUTE_PATH_TO_GAMA = 'C:\\git\\';
var modelPath = ABSOLUTE_PATH_TO_GAMA + 'gama/msi.gama.models/models/Tutorials/Luneray flu/models/model5.gaml';
var experimentName = 'main';

gama = new GAMA("ws://localhost:6868/", modelPath, experimentName);
gama.connect(on_connected, on_disconnected);
function on_connected() {
	start_sim();
	start_renderer();
}
function on_disconnected() {
	clearInterval(updateSource);
}
function start_sim() {
	gama.launch();
	gama.evalExpr("species(world).microspecies", createSources);
	gama.evalExpr("CRS_transform(world.location,\"EPSG:4326\")", fitzoom);
	gama.play();
}

function start_renderer() {
	updateSource = setInterval(() => {
		console.log(".");
		geojsonMap.forEach(logMapElements);
	}, 100);
}
function logMapElements(value, key, mm) {
	gama.getPopulation(key, ["name"], "EPSG:4326", updateLayer);

	function updateLayer(message) {
		if (typeof message == "object" || message == "") {

		} else {
			// geojson = null;
			// console.log(message);
			var tmp = JSON.parse(message);
			if (!map.style.getLayer(`source${key}`))
				addLayer(tmp.features[0].geometry.type, key);
			map.getSource(`source${key}`).setData(tmp);

		}
	}
}

function createSources(ee) {
	ee = JSON.parse(ee).result.replace(/[\])}[{(]/g, '').replace(/['"]+/g, '');
	var eee = ee.split(",");
	eee.forEach((e) => {
		geojsonMap.set(e, {
			'type': 'FeatureCollection',
			'features': [
				{
					'type': 'Feature',
					'geometry': {
						'type': 'Point',
						'coordinates': [0, 0]
					}
				}
			]
		});
		map.addSource(`source${e}`, {
			type: 'geojson',
			data: geojsonMap.get(e)
		});
	});

	geojsonMap.forEach(logMapElements);
}
function fitzoom(ee) {
	ee = JSON.parse(ee).result.replace(/[{}]/g, "");
	var eee = ee.split(",");
	console.log(eee[0]);
	console.log(eee[1]);
	centerPoint = [eee[0], eee[1]];
	fitZoomCenter();
	document.getElementById('div-loader').remove();
}
function addLayer(type, key) {

	if (type === 'LineString') {
		map.addLayer({
			'id': `source${key}`,
			'type': 'line',
			'source': `source${key}`, // reference the data source
			'layout': {},
			'paint': {
				'line-color': '#000',
				'line-width': 3
			}
		});
	} else if (type === 'Point') {

		map.addLayer({
			'id': `source${key}`,
			'type': 'circle',
			'source': `source${key}`, // reference the data source
			'layout': {},
			'paint': {
				'circle-radius': {
					'base': 1.75,
					'stops': [
						[12, 1],
						[22, 50]
					]
				},
			}
		});
	} else {

		map.addLayer({
			'id': `source${key}`,
			'type': 'fill',
			'source': `source${key}`, // reference the data source
			'layout': {},
			'paint': {
				'fill-color': '#0080ff', // blue color fill
				'fill-opacity': 0.5
			}
		});
	}
	map.on('click', `source${key}`, (e) => {
		new mapboxgl.Popup()
			.setLngLat(e.lngLat)
			.setHTML(e.features[0].properties.name)
			.addTo(map);
	});

} 