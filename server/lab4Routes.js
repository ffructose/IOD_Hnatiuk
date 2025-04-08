const express = require('express');
const router = express.Router();
const pool = require("./db");

// Отримати пісні за місцями (1-3) для кожного користувача
router.get('/song-places', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT user_id, place, song_id
      FROM SongPlace
      WHERE place IN (1, 2, 3)
      ORDER BY user_id, place
    `);

        const data = {};

        result.rows.forEach(row => {
            if (!data[row.user_id]) {
                data[row.user_id] = [];
            }
            data[row.user_id][row.place - 1] = row.song_id;
        });

        res.json(data);
    } catch (err) {
        console.error('Помилка при отриманні даних з SongPlace:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

// Додай новий ендпоінт для отримання song_id з evrsongs
router.get('/songnames', async (req, res) => {
    try {
        const result = await pool.query('SELECT song_name FROM evrsongs');
        const songNames = result.rows.map(row => row.song_name);
        res.json(songNames);
    } catch (err) {
        console.error('Помилка при отриманні пісень:', err);
        res.status(500).send('Server error');
    }
});

// Додай новий ендпоінт для отримання song_id з evrsongs
router.get('/evrsongs', async (req, res) => {
    try {
        const result = await pool.query('SELECT song_id FROM evrsongs');
        const songIds = result.rows.map(row => row.song_id);
        res.json(songIds);
    } catch (err) {
        console.error('Помилка при отриманні пісень:', err);
        res.status(500).send('Server error');
    }
});


// Отримати компромісні ранжування (усі або за методом)
router.get('/compromise-rankings', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT method, song_id, position, sum_distance, max_distance
        FROM compromise_rankings
        ORDER BY method, position
      `);

        const data = { E1: [], E2: [] };

        result.rows.forEach(row => {
            if (row.method === 'E1') {
                data.E1.push(row);
            } else if (row.method === 'E2') {
                data.E2.push(row);
            }
        });

        res.json(data); // ⚠️ не res.json(result.rows), а саме data!
    } catch (err) {
        console.error('❌ Помилка при отриманні компромісних ранжувань:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Додати запис до таблиці Protocol
router.post("/log-action", async (req, res) => {
    const { user_id, action } = req.body;

    if (!user_id || !action) {
        return res.status(400).json({ error: "❌ Неправильні дані" });
    }

    try {
        await pool.query(
            "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
            [user_id, action]
        );
        res.json({ message: "✅ Дія записана у протокол" });
    } catch (error) {
        console.error("❌ Помилка логування дії:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

router.get("/info", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ Не авторизовано" });
    }

    try {
        // 🔹 Отримуємо user_id через sessions
        const session = await pool.query("SELECT user_id FROM sessions WHERE token = $1", [token]);

        if (session.rows.length === 0) {
            return res.status(401).json({ error: "❌ Невірний токен" });
        }

        const user = await pool.query("SELECT id, username, level FROM users WHERE id = $1", [session.rows[0].user_id]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "❌ Користувач не знайдений" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("❌ Помилка отримання інформації про користувача:", error);
        res.status(500).json({ error: "❌ Помилка сервера" });
    }
});

module.exports = router;
