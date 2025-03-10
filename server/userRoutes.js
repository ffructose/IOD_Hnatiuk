const express = require("express");
const client = require("./db");
const router = express.Router();

// Отримати рівень доступу користувача
router.get("/info", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ Не авторизовано" });
    }

    try {
        const user = await client.query("SELECT id, username, level FROM users WHERE id = (SELECT user_id FROM sessions WHERE token = $1)", [token]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "❌ Невірний токен" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("❌ Помилка отримання інформації про користувача:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

// Отримати всі записи з таблиці `Protocol`
router.get("/protocol", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM Protocol ORDER BY time DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Помилка отримання Protocol:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

module.exports = router;
