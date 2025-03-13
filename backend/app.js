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

function startServer(app) {
    const port = process.env.S_PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}