const express = require("express");
const client = require("./db");
const router = express.Router();

// Отримати список користувачів
router.get("/users", async (req, res) => {
    const result = await client.query("SELECT id, username, level FROM users");
    res.json(result.rows);
});

// Змінити рівень доступу користувача
router.put("/change-level/:id", async (req, res) => {
    const { level } = req.body;
    await client.query("UPDATE users SET level = $1 WHERE id = $2", [level, req.params.id]);
    res.sendStatus(200);
});

// Видалити користувача
router.delete("/delete-user/:id", async (req, res) => {
    await client.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.sendStatus(200);
});

// Очистити протокол
router.delete("/clear-protocol", async (req, res) => {
    await client.query("DELETE FROM Protocol");
    res.sendStatus(200);
});

module.exports = router;
