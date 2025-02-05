const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "../.env" });
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const { defineAPIEndpoints } = require("./routes/api");
const { pool } = require("./db_conn");

const app = express();

configureApp(app);
defineAPIEndpoints(app);
startServer(app);

function configureApp(app) {
    const sessionStore = new MySQLStore({}, pool);

    app.use(session({
        secret: "secret_key",
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            secure: false,
        }
    }));

    app.use(cors());
    app.use(bodyParser.json());
    console.log("databaze pripojena")
}

function startServer(app) {
    app.listen(process.env.S_PORT, () => {
        console.log(`Server running at http://localhost:${process.env.S_PORT}`);
    });
}
