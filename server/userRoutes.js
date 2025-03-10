const express = require("express");
const client = require("./db");
const router = express.Router();

// Отримати рівень доступу користувача
// Отримати рівень доступу користувача
router.get("/info", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ Не авторизовано" });
    }

    try {
        // 🔹 Отримуємо user_id через sessions
        const session = await client.query("SELECT user_id FROM sessions WHERE token = $1", [token]);

        if (session.rows.length === 0) {
            return res.status(401).json({ error: "❌ Невірний токен" });
        }

        const user = await client.query("SELECT id, username, level FROM users WHERE id = $1", [session.rows[0].user_id]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "❌ Користувач не знайдений" });
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

// Отримати всі записи з таблиці `SongPlace` разом із іменами користувачів та назвами пісень
router.get("/songs-poll", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT 
                users.id AS user_id,
                users.username,
                MAX(CASE WHEN songplace.place = 1 THEN eurosongs.song_name ELSE NULL END) AS first_place,
                MAX(CASE WHEN songplace.place = 2 THEN eurosongs.song_name ELSE NULL END) AS second_place,
                MAX(CASE WHEN songplace.place = 3 THEN eurosongs.song_name ELSE NULL END) AS third_place
            FROM songplace
            JOIN users ON songplace.user_id = users.id
            JOIN eurosongs ON songplace.song_id = eurosongs.song_id
            GROUP BY users.id, users.username
            ORDER BY users.id;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Помилка отримання голосування:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

module.exports = router;
