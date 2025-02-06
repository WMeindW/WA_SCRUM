const express = require("express");
require("dotenv").config({ path: "../.env" });

const { defineAPIEndpoints } = require("./routes/api");
const { pool } = require("./db_conn");

const app = express();

defineAPIEndpoints(app);
startServer(app);


function startServer(app) {
    const port = process.env.S_PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
