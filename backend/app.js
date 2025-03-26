const express = require("express");
require("dotenv").config({ path: "/.env" });
const cors = require("cors");
const bodyParser = require("body-parser");

const { defineAPIEndpoints } = require("./routes/api");
const { pool } = require("./db_conn");
const path = require("path");

const app = express();

configureApp(app)
defineAPIEndpoints(app);
startServer(app);

/**
 * @function configureApp
 * @description Konfiguruje Express aplikaci s middleware pro CORS, JSON parsování a URL kódování.
 * @param {object} app Express aplikace.
 */
function configureApp(app) {
    const corsOptions = {
        origin: "http://localhost:5173",
        credentials: true,
    };
    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
}

/**
 * @function startServer
 * @description Spouští server na definovaném portu.
 * @param {object} app Express aplikace.
 */
function startServer(app) {
    const port = process.env.S_PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}