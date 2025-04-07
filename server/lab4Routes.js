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


// Отримати всі записи з таблиці `SongPlace` разом із іменами користувачів та назвами пісень
router.get("/songs-poll", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                users.id AS user_id,
                users.username,
                MAX(CASE WHEN songplace.place = 1 THEN evrsongs.song_name ELSE NULL END) AS first_place,
                MAX(CASE WHEN songplace.place = 2 THEN evrsongs.song_name ELSE NULL END) AS second_place,
                MAX(CASE WHEN songplace.place = 3 THEN evrsongs.song_name ELSE NULL END) AS third_place
            FROM songplace
            JOIN users ON songplace.user_id = users.id
            JOIN evrsongs ON songplace.song_id = evrsongs.song_id
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
