// express
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
//nodejs
import fsAsync from "fs/promises";
import path from "path";
import url from "url";
// libs
import randomGeojson, { position } from "geojson-random";
import pg from "pg";
import random from "random";
import { io } from "socket.io-client";

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

/* 10000 геоточек магазинов */
const randomGeoPoints = randomGeojson.point(5, bbox);
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
        storeId: storeId,
        name: `Bessoli-RetailStore-${storeId}`,
        featureObj: value,
        range: combinedRange,
        async startSellings() {
            const receipt = generateRandomReceipt();
            await sleep(random.int(receipt.length, receipt.length * 5) * 1000);
            socket.emit("sale", {
                storeId: toString(this.storeId),
                featureObj: this.featureObj,
                receipt: receipt,
            });
            this.startSellings();
        },
    });
});

function startAll() {
    retailStores.forEach((storeObj) => storeObj.startSellings());
    console.log("started selling");
}
startAll();

// setInterval(() => {
//     console.log("### TOTAL SALES: ", salesCounter);
//     console.log("### TOTAL PRODUCTS: ", soldProductsCounter);
// }, 5000);

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());
// const PORT = 7351;
// app.listen(PORT, () => {
//      console.log(`App listening at http://localhost:${PORT}`);
// });

pgPool.end();
// socket.disconnect();
