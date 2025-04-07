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
    const method = req.query.method; // 'E1' або 'E2', необов'язковий параметр
  
    try {
      const query = method
        ? 'SELECT * FROM compromise_rankings WHERE method = $1 ORDER BY method, position'
        : 'SELECT * FROM compromise_rankings ORDER BY method, position';
  
      const values = method ? [method] : [];
  
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error("❌ Помилка при отриманні компромісних ранжувань:", err);
      res.status(500).json({ error: 'Помилка сервера при читанні compromise_rankings' });
    }
  });
  


module.exports = router;
