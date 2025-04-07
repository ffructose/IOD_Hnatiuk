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

// Зберегти компромісні ранжування
router.post('/compromise-rankings', async (req, res) => {
  const { method, rankings } = req.body;

  if (!method || !Array.isArray(rankings)) {
    return res.status(400).json({ error: 'Невірний формат запиту' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO compromise_rankings (method, song_id, position, sum_distance, max_distance)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query('DELETE FROM compromise_rankings WHERE method = $1', [method]);

    for (const row of rankings) {
      const { song_id, position, sum_distance = null, max_distance = null } = row;

      await client.query(insertQuery, [method, song_id, position, sum_distance, max_distance]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Компромісне ранжування збережено' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Помилка збереження компромісних ранжувань:", err);
    res.status(500).json({ error: 'Помилка сервера' });

  } finally {
    client.release();
  }
});


module.exports = router;
