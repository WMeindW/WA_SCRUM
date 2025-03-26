const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

/**
 * @module db_conn
 * @description Modul pro vytvoření a exportování poolu spojení k MySQL databázi.
 */

/**
 * @constant {mysql.Pool} pool
 * @description Vytvoří pool spojení k MySQL databázi s použitím proměnných prostředí.
 */
const pool = mysql.createPool({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { pool };