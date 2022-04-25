# strava-heatmap-to-kmz

Generate KMZ files from the [Strava Global Heatmap](http://labs.strava.com/heatmap/). This allows you to use the heatmap as a map layer (currently 1000×1000 pixels) on a mobile device (e.g. iPhone or Garmin), which enables offline use and helps you to locate where the hell you are in the woods.

## Dependencies

-   Node.js
-   NPM

## Usage

`npm run start <lat,lon> <output_file>`

For example:

`npm run start 42.32733,-72.70095 /Users/akahn/strava.kmz`

## How it works

The program loads the Strava Heatmap in a headless puppeteer browser and takes a snapshot of the page and saves the map bounds. It then constructs a KML file declaring an image overlay positioned using the map bounds loaded previously. It then zips up this KML file along with the snapshot image, creating a KMZ that can be used in Google Earth and other programs.

## TODO

-   Use proper CLI option parsing
-   Make map size configurable
