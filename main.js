const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const _ = require("lodash");
const zip = new require("node-zip")();

const lon = Number.parseFloat(process.argv[2]);
const lat = Number.parseFloat(process.argv[3]);
const sessionID = process.argv[4];
const cookieKey = "_strava4_session";

if (!(lon && lat && sessionID)) {
	console.log("Must include latitude, longitude and session-id");
	console.log(
		"Remember to use the '--' end of options flag to allow negative numbers"
	);
	process.exit(1);
}

//create template file
const createTemplate = async () => {
	const templateData = await fs.readFile("kml.template", "utf8");
	const kmlTemplate = _.template(templateData);
	return kmlTemplate;
};

//execution
(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	//disable geolocation
	const context = browser.defaultBrowserContext();
	await context.overridePermissions(
		`https://www.strava.com/heatmap#14.33/${lon}/${lat}/hot/ride`,
		["geolocation"]
	);

	page.viewport({ width: 1000, height: 1000 });
	await page.setCookie({
		name: cookieKey,
		value: sessionID,
		domain: ".strava.com",
	});
	await page.goto(
		`https://www.strava.com/heatmap#14.33/${lon}/${lat}/hot/ride`,
		{ waitUntil: "networkidle2" }
	);

	const bounds = await page.evaluate(async () => {
		const header = document.querySelector("#global-header");
		const modal = document.querySelector("#learn-more-modal");
		const zoomControls = document.querySelector("#controls");
		const cookiesBanner = document.querySelector("#stravaCookieBanner");
		const fadeLayer = document.querySelector(".modal-backdrop");
		const sidebar = document.querySelector("#sidebar");
		const input = document.querySelector(".mapboxgl-control-container");
		fadeLayer.remove();
		input.remove();
		zoomControls.remove();
		if (cookiesBanner) {
			cookiesBanner.remove();
		}
		modal.remove();
		header.remove();
		sidebar.remove();

		const bounds = map.getBounds();
		return {
			east: bounds.getEast(),
			west: bounds.getWest(),
			north: bounds.getNorth(),
			south: bounds.getSouth(),
		};
	});

	await page.screenshot({ path: "strava.png" });
	await browser.close();

	const template = await createTemplate();
	const kml = template(_.merge(bounds, { lat: lat, lon: lon }));

	// compress and write
	zip.file("strava.png", await fs.readFile("./strava.png"));
	zip.file("doc.kml", kml);
	const data = zip.generate({ base64: false, compression: "DEFLATE" });

	try {
		await fs.writeFile(`${lat}-${lon}heatmap.kmz`, data, "binary");
		await fs.unlink("./strava.png");
	} catch (e) {
		console.error("Error when writing file");
		console.error(e.message);
		process.exit();
	}
})();
