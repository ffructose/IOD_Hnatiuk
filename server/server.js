const express = require("express");
const connection = require("./db");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const client = require("./db");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // Якщо немає змінної середовища, використовується дефолтний ключ

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Віддає файли з папки public

// 📌 Логін
app.post("/login", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на вхід:", req.body);

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        // Перевіряємо, чи існує користувач
        const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        // Перевіряємо пароль
        const isValidPassword = bcrypt.compareSync(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        // Генеруємо JWT-токен
        const token = jwt.sign({ username: user.rows[0].username }, SECRET_KEY, { expiresIn: "1h" });

        console.log("✅ Вхід успішний для:", username);

        // 📌 Надсилаємо токен та повідомляємо про успіх
        res.json({ message: "✅ Вхід успішний!", token });

    } catch (err) {
        console.error("❌ Помилка входу:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});

// 📌 Головна сторінка після входу
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// 📌 Перевірка токена
app.get("/user", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Не авторизовано" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ username: decoded.username });
    } catch (error) {
        res.status(401).json({ message: "❌ Недійсний токен" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));
