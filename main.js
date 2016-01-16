var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs'),
    zip = new require('node-zip')(),
    _ = require('lodash-node');

if (system.args.length != 3) {
  console.warn("Must provide lat,lon and output directory arguments");
  phantom.exit();
}

var outputFile = system.args[system.args.length - 1],
    center = system.args[system.args.length - 2];

try {
  fs.write(outputFile, '');
}
catch (e) {
  console.warn('Cannot write to file ' + outputFile);
  phantom.exit();
}

if (center.split(',').length != 2) {
  console.warn('Must supply lat,lon in the form of lat,lon')
  phantom.exit();
}
else {
  var latlon = center.split(','),
      lat = latlon[0],
      lon = latlon[1];
}

var zoom = 15,
    size = 1000,
    east, west, north, south, bounds;

var kmlTemplate = _.template(fs.read('kml.template', 'utf8'));

page.viewportSize = { width: size, height: size };
page.open('http://labs.strava.com/heatmap/#15/' + lon + '/' + lat + '/gray/bike', function() {
  var bounds = page.evaluate(function() {
    $('#header, #controls, #sidebar').remove();

    // Force redraw and recalculation of map bounds
    $(window).trigger('resize');
    map.invalidateSize();

    var bounds = map.getBounds();
    return {east: bounds.getEast(),
            west: bounds.getWest(),
            north: bounds.getNorth(),
            south: bounds.getSouth()};
  });

  page.render('strava.png', {quality: 100});
  var kml = kmlTemplate(_.merge(bounds, {lat: lat, lon: lon}));
  zip.file('strava.png', fs.read('strava.png', {mode: 'rb'}), {binary: true});
  zip.file('doc.kml', kml);
  fs.write(outputFile, zip.generate({type: 'string', compression: 'DEFLATE'}), 'wb');
  fs.remove('strava.png');

  phantom.exit()
});

