const express = require('express');
const client = require('./db'); // Підключення до бази
const router = express.Router();

// Збереження пісень у таблиці SongPlace
router.post("/save-places", async (req, res) => {
    const { user_id, places } = req.body;

    if (!user_id || !places || places.length !== 3) {
        return res.status(400).json({ error: "Неправильні дані" });
    }

    try {
        // Видаляємо попередні дані користувача
        await client.query("DELETE FROM SongPlace WHERE user_id = $1", [user_id]);

        // Додаємо нові дані
        for (let i = 0; i < places.length; i++) {
            const { song_id, place } = places[i];
            await client.query(
                "INSERT INTO SongPlace (song_id, user_id, place) VALUES ($1, $2, $3)",
                [song_id, user_id, place]
            );
        }

        // Логування дії користувача
        await client.query(
            "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
            [user_id, `Користувач зберіг вибір пісень на 1, 2, 3 місце`]
        );

        res.json({ message: "Дані успішно збережено" });
    } catch (error) {
        console.error("Помилка збереження місць:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});


// Логування дій користувача у `Protocol`
router.post("/log-action", async (req, res) => {
    const { user_id, action } = req.body;

    if (!user_id || !action) {
        return res.status(400).json({ error: "❌ Неправильні дані" });
    }

    try {
        await client.query(
            "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
            [user_id, action]
        );
        res.json({ message: "✅ Дія записана у протокол" });
    } catch (error) {
        console.error("❌ Помилка логування дії:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

module.exports = router;
