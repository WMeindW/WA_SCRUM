const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [{ username: "admin", password: "password123" }];

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, token: "fake-jwt-token" });
    } else {
        res.json({ success: false });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
