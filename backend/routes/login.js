const bcrypt = require("bcrypt");
const { pool } = require("../db_conn");

function defineAPILoginEndpoints(app) {
    const express = require("express");
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.body;

        console.log("Received login attempt:", { email, password });

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        try {
            const response = await fetch("https://www.spsejecna.cz/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ user: email, pass: password })
            });

            console.log("SPSE Ječná login response status:", response.status);

            if (response.status === 302) {
                return res.status(200).send("Login successful");
            } else {
                return res.status(401).send("Invalid username or password");
            }
        } catch (err) {
            console.error("Error during login:", err);
            return res.status(500).send("Error processing login request");
        }
    });

    app.post("/api/register", async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await pool.query("INSERT INTO users (email, password_hash, last_rating_date) VALUES (?, ?, CURDATE())", [email, hashedPassword]);

            return res.status(201).send("User registered successfully");
        } catch (err) {
            console.error("Error during user registration:", err);
            return res.status(500).send("Error processing registration request");
        }
    });
}

module.exports = { defineAPILoginEndpoints };
