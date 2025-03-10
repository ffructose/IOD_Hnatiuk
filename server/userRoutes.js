const express = require('express');
const jwt = require('jsonwebtoken');
const client = require('./db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 Отримати інформацію про користувача
router.get("/info", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "❌ Не авторизовано" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ username: decoded.username, level: decoded.level });
    } catch (error) {
        res.status(401).json({ message: "❌ Недійсний токен" });
    }
});

module.exports = router;
