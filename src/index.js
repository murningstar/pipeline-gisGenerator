// express
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
//nodejs
import fsAsync from "fs/promises";
import { createServer } from "http";
import path from "path";
import url from "url";
// libs
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers"
import randomGeojson, { position } from "geojson-random";
import pg from "pg";
import random from "random";
import { io } from "socket.io-client";

const argv = yargs(hideBin(process.argv))
    .option("stores", {
        alias: "number",
        type: "number",
        description: "Number of stores that will generate data",
    })
    .help().argv;
const storesNumber = process.env.STORES_NUMBER
    ? process.env.STORES_NUMBER
    : argv.stores;
console.log('Number of working stores: ', storesNumber);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function getRandomInt(max) {
    return random.int(1, max);
}

const socket = io("http://proxy:3773");
socket.on("connect", () => {
    console.log("Connected to proxy!");
});
const pgPool = new pg.Pool({
    user: "postgres",
    password: "mypassword",
    host: "postgis",
    port: 5432,
    database: "osm",
});

const bboxQuery = await pgPool.query(
    "SELECT\
      ST_YMin(ST_Extent(way)) AS minlat,\
      ST_XMin(ST_Extent(way)) AS minlon,\
      ST_YMax(ST_Extent(way)) AS maxlat,\
      ST_XMax(ST_Extent(way)) AS maxlon\
     from planet_osm_roads"
);
const { minlat, minlon, maxlat, maxlon } = bboxQuery.rows[0];
// console.dir(bboxQuery.rows[0], { depth: null });

const bbox = [minlon, minlat, maxlon, maxlat];

/* Количество геоточек (и соотв.) магазинов */
const randomGeoPoints = randomGeojson.point(storesNumber, bbox);
// console.dir(randomGeoPoints.features[0], { depth: null });

const jsonRange = JSON.parse(
    await fsAsync.readFile("./range.json", { encoding: "utf-8" })
).range; // range.food | range.householdChemicals

var combinedRange = [...jsonRange.food, ...jsonRange.householdChemicals];

function generateRandomReceipt() {
    const receipt = [];
    let positionsCount = getRandomInt(20); // Чтобы больше 20 позиций в одном чеке не было (в датасете всего 29)
    if (positionsCount > 10) {
        // хочу, чтобы слишком МНОГО позиций было реже
        Math.random() > 0.5
            ? null
            : (positionsCount = positionsCount - getRandomInt(6));
    }
    if (positionsCount < 4) {
        // хочу, чтобы слишком МАЛО позиций было реже
        Math.random() > 0.4 ? null : (positionsCount = 4);
    }
    const usedIndices = new Set();
    while (receipt.length < positionsCount) {
        const randomProductIx = random.int(0, 28);
        if (!usedIndices.has(randomProductIx)) {
            usedIndices.add(randomProductIx);
            receipt.push(combinedRange[randomProductIx]);
        }
    }
    return receipt;
}

const retailStores = [];

randomGeoPoints.features.forEach((value, i) => {
    const storeId = i + 1;
    retailStores.push({
        storeId: `${storeId}`,
        name: `Bessoli-RetailStore-${storeId}`,
        featureObj: value,
        range: combinedRange,
        async startSellings() {
            const receipt = generateRandomReceipt();
            await sleep(random.int(receipt.length, receipt.length * 5) * 1000);
            socket.emit("sale", {
                storeId: `${this.storeId}`,
                featureObj: this.featureObj,
                receipt: receipt,
            });
            this.startSellings(); //рекурсия
        },
    });
});

function startAll() {
    retailStores.forEach((storeObj) => storeObj.startSellings());
    console.log("started selling");
}

const app = express();
const server = createServer(app);
app.use(
    cors({
        origin: "*",
    })
);
app.use(bodyParser.json());
app.get("/stores", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.send(JSON.stringify(retailStores));
    res.end();
});
const PORT = 7331;
server.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
    socket.connect();
    startAll();
});
server.on("close", () => {
    socket.disconnect();
});
pgPool.end();
