const express = require("express");
require("dotenv").config({ path: "../.env" });
const cors = require("cors");
const bodyParser = require("body-parser");

const { defineAPIEndpoints } = require("./routes/api");
const { pool } = require("./db_conn");
const path = require("path");

const app = express();

configureApp(app)
defineAPIEndpoints(app);
startServer(app);


function configureApp(app) {
    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // Middleware pro URL-encoded data
}

function startServer(app) {
    const port = process.env.S_PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}