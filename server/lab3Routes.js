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


module.exports = router;
