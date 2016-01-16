# strava-heatmap-to-kmz

Generate KMZ files from the [Strava Global Heatmap](http://labs.strava.com/heatmap/). This allows you to use the heatmap as a map layer (currently 1000×1000 pixels) on a mobile device (e.g. iPhone or Garmin), which enabling offline use and helps you to locate where the hell you are in the woods.

## Dependencies

* Node.js
* NPM
* Phantom.js 2.0

## Usage

`npm run generate <lat,lon> <output_file>`

For example:

`npm run generate 42.32733,-72.70095 /Users/akahn/strava.kmz`

If you encounter issues, try running in debug mode:

`npm run debug 42.32733,-72.70095 /Users/akahn/strava.kmz`

This makes Phantom.js write its debug log to stdout.

## How it works

The program loads the Strava Heatmap in a headless WebKit web browser via PhantomJS and takes a snapshot of the page and saves the map bounds. It then constructs a KML file declaring an image overlay positioned using the map bounds loaded previously. It then zips up this KML file along with the snapshot image, creating a KMZ that can be used in Google Earth and other programs.

## TODO

* Use proper CLI option parsing
* Make map size configurable
