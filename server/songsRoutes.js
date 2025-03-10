const express = require('express');
const client = require('./db'); // Підключення клієнта БД

const router = express.Router();

router.get("/", (req, res) => {  // Змінив на "/" щоб відповідати маршруту "/songs"
    client.query("SELECT * FROM EuroSongs", (err, results) => {
        if (err) {
            console.error("Помилка запиту:", err);
            res.status(500).json({ error: "Помилка сервера" });
            return;
        }
        res.json(results.rows);  // Якщо використовується PostgreSQL, потрібно results.rows
    });
});

module.exports = router;
