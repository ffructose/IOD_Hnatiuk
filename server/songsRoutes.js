const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('./db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.get("/songs", (req, res) => {
    db.query("SELECT * FROM EuroSongs", (err, results) => {
        if (err) {
            console.error("Помилка запиту:", err);
            res.status(500).json({ error: "Помилка сервера" });
            return;
        }
        res.json(results);
    });
});

module.exports = router;
