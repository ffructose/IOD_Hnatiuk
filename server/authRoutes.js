const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 Реєстрація
router.post("/register", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на реєстрацію:", req.body);
        const { username, password, full_name } = req.body;

        if (!username || !password || !full_name) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        const userExists = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "❌ Користувач вже існує!" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const hashedFullName = bcrypt.hashSync(full_name, 10); // Шифруємо ПІБ

        const result = await client.query(
            "INSERT INTO users (username, password, full_name, level) VALUES ($1, $2, $3, $4) RETURNING id, username, level",
            [username, hashedPassword, hashedFullName, "user"]
        );

        console.log("✅ Користувач зареєстрований:", result.rows[0]);
        res.json({ message: "✅ Реєстрація успішна!", user: result.rows[0] });
    } catch (err) {
        console.error("❌ Помилка реєстрації:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});

// 🔹 Логін
router.post("/login", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на вхід:", req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        const isValidPassword = bcrypt.compareSync(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        const token = jwt.sign({ username: user.rows[0].username, level: user.rows[0].level }, SECRET_KEY, { expiresIn: "1h" });

        console.log("✅ Вхід успішний для:", username);
        res.json({ message: "✅ Вхід успішний!", token });

    } catch (err) {
        console.error("❌ Помилка входу:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});

module.exports = router;
