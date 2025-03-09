const express = require('express');
const connection = require('./db');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const client = require('./db');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Віддає файли з папки public


app.post("/register", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на реєстрацію:", req.body);

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        // Перевіряємо, чи є користувач
        const userExists = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "❌ Користувач з таким іменем вже існує!" });
        }

        // Хешуємо пароль
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Вставляємо користувача (SQL-формат для PostgreSQL)
        const result = await client.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, hashedPassword]
        );

        console.log("✅ Користувач зареєстрований:", result.rows[0]);
        res.json({ message: "✅ Реєстрація успішна!", user: result.rows[0] });
    } catch (err) {
        console.error("❌ Помилка реєстрації:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});


// Вхід
const jwt = require("jsonwebtoken"); // Додай бібліотеку JWT

app.post("/login", async (req, res) => {
    try {
        console.log("🔹 Отримано запит на вхід:", req.body);

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "❌ Всі поля обов'язкові!" });
        }

        // Перевірка чи існує користувач
        const user = await client.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        // Перевірка пароля
        const isValidPassword = bcrypt.compareSync(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "❌ Невірний логін або пароль" });
        }

        // Генеруємо JWT-токен
        const token = jwt.sign({ username: user.rows[0].username }, "your_secret_key", { expiresIn: "1h" });

        console.log("✅ Вхід успішний для:", username);
        
        // Відправляємо токен та редиректимо
        res.json({ message: "✅ Вхід успішний!", token });

    } catch (err) {
        console.error("❌ Помилка входу:", err);
        res.status(500).json({ error: "❌ Внутрішня помилка сервера" });
    }
});


// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));


app.get("/user", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Не авторизовано" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");
        res.json({ username: decoded.username });
    } catch (error) {
        res.status(401).json({ message: "❌ Недійсний токен" });
    }
});


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

