import path from "node:path";
import _bytes from "bytes";
import CachedFetch from "@11ty/eleventy-fetch";

function bytes(size) {
  return _bytes(size, {
    decimalPlaces: 1,
    fixedDecimals: true,
    unit: "KB",
    unitSeparator: " ",
  });
}

let breaches = await fetchBreaches();
breaches = breaches.filter(b => b.Domain);
console.log(breaches.length);

let { results: ddg } = await fetchDDGLogos();
ddg = statsToMap(ddg);

let {results: google } = await fetchGoogleLogos();
google = statsToMap(google);

let googleBytes = 0;
let ddgBytes = 0;

const NA = ":x:";

console.log("NAME | GOOGLE<br>DIMENSIONS | GOOGLE<br>SIZE | DDG<br>DIMENSIONS | DDG<br>SIZE\n:----|:----:|----:|:----:|----:|");
for (const b of breaches) {
  const googleLogo = google.get(b.Domain);
  const ddgLogo = ddg.get(b.Domain);
  googleBytes += googleLogo?.size || 0;
  ddgBytes += ddgLogo?.size || 0;
  console.log([
    `[${b.Name}](${b.Domain})`,
    // b.Domain,
    googleLogo?.dimensions || NA,
    bytes(googleLogo?.size) || NA,
    ddgLogo?.dimensions || NA,
    bytes(ddgLogo?.size) || NA,
  ].join(" | "));
}
console.log(`\n\nGoogle: ${bytes(googleBytes)} (${google.size} logos)    DDG: ${bytes(ddgBytes)} (${ddg.size} logos)`);

function statsToMap(stats = []) {
  return stats.reduce((map, logo) => {
    const domain = path.basename(logo.logo, ".png");
    map.set(domain, logo);
    return map;
  }, new Map());
}

async function fetchBreaches() {
  return _fetch("https://haveibeenpwned.com/api/v3/breaches");
}

async function fetchDDGLogos() {
  return _fetch("https://raw.githubusercontent.com/pdehaan/blurts-ddg-logos/main/stats.json");
}

async function fetchGoogleLogos() {
  return _fetch("https://raw.githubusercontent.com/pdehaan/blurts-gstatic-logos/main/stats.json");
}

async function _fetch(href, options={}) {
  options.duration ??= "8h";
  options.type ??= "json";
  return CachedFetch(href, options);
}
