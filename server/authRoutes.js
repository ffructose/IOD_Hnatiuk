const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('./db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 Реєстрація з іменем користувача та логуванням у Protocol
router.post("/register", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на реєстрацію:", req.body);
        const { full_name, username, password } = req.body;

        if (!full_name || !username || !password) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        const userExists = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "❌ Користувач вже існує!" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const result = await client.query(
            "INSERT INTO users (full_name, username, password, level) VALUES ($1, $2, $3, $4) RETURNING id, username, level",
            [full_name, username, hashedPassword, "user"]
        );

        const user_id = result.rows[0].id;

        // 🔹 Логування реєстрації у Protocol
        await client.query(
            "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
            [user_id, `Реєстрація нового користувача, логін: ${username}`]
        );

        console.log("✅ Користувач зареєстрований:", result.rows[0]);
        res.json({ message: "✅ Реєстрація успішна!", user: result.rows[0] });
    } catch (err) {
        console.error("❌ Помилка реєстрації:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});

// 🔹 Логін з логуванням у Protocol
// 🔹 Логін користувача з додаванням токена в sessions
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

        const token = jwt.sign(
            { user_id: user.rows[0].id, username: user.rows[0].username, level: user.rows[0].level },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // 🔹 Видаляємо старий токен користувача (якщо він є)
        await client.query("DELETE FROM sessions WHERE user_id = $1", [user.rows[0].id]);

        // 🔹 Зберігаємо новий токен в sessions
        await client.query("INSERT INTO sessions (user_id, token) VALUES ($1, $2)", [user.rows[0].id, token]);

        console.log("✅ Вхід успішний для:", username);
        res.json({ message: "✅ Вхід успішний!", token, user_id: user.rows[0].id });

    } catch (err) {
        console.error("❌ Помилка входу:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});


module.exports = router;
