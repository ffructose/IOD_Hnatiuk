const express = require("express");
const client = require("./db");
const router = express.Router();

// Отримати список користувачів
router.get("/users", async (req, res) => {
    try {
        const result = await client.query("SELECT id, username, level FROM users");
        res.json(result.rows);
    } catch (error) {
        console.error("Помилка отримання списку користувачів:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Змінити рівень доступу користувача
router.put("/change-level/:id", async (req, res) => {
    const { level } = req.body;
    try {
        await client.query("UPDATE users SET level = $1 WHERE id = $2", [level, req.params.id]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Помилка зміни рівня доступу:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Видалити користувача
router.delete("/delete-user/:id", async (req, res) => {
    try {
        await client.query("DELETE FROM users WHERE id = $1", [req.params.id]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Помилка видалення користувача:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Очистити протокол
router.delete("/clear-protocol", async (req, res) => {
    try {
        await client.query("DELETE FROM Protocol");
        res.sendStatus(200);
    } catch (error) {
        console.error("Помилка очищення протоколу:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Отримати список пісень
router.get("/songs", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM EuroSongs ORDER BY song_id ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("Помилка отримання списку пісень:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Додати нову пісню
router.post("/add-song", async (req, res) => {
    const { song_name, author, country } = req.body;
    if (!song_name || !author || !country) {
        return res.status(400).json({ error: "Усі поля обов'язкові!" });
    }
    
    try {
        await client.query(
            "INSERT INTO EuroSongs (song_name, author, country) VALUES ($1, $2, $3)",
            [song_name, author, country]
        );
        res.status(201).json({ message: "✅ Пісня успішно додана!" });
    } catch (error) {
        console.error("Помилка додавання пісні:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Видалити пісню за ID
router.delete("/delete-song/:id", async (req, res) => {
    try {
        await client.query("DELETE FROM EuroSongs WHERE song_id = $1", [req.params.id]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Помилка видалення пісні:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

module.exports = router;
