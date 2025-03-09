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


// Маршрут реєстрації
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Всі поля обов'язкові!" });
    }
  
    
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await client.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, hashedPassword]
        );
        res.json({ message: "✅ Реєстрація успішна!", user: result.rows[0] });
    } catch (err) {
        console.error("❌ Помилка реєстрації:", err);
        res.status(500).json({ error: err.message });
    }
});   

// Вхід
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0 || !bcrypt.compareSync(password, user.rows[0].password)) {
        return res.status(401).json({ message: "❌ Неправильний логін або пароль" });
    }

    res.json({ message: `✅ Вітаю, ${username}! Вхід успішний.` });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));


app.get('/users', async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM users;");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

