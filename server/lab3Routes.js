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
// Зберегти компромісні ранжування
router.post('/compromise-rankings', async (req, res) => {
  const { method, rankings } = req.body;

  if (!method || !Array.isArray(rankings)) {
    return res.status(400).json({ error: 'Невірний формат запиту' });
  }

  try {
    // Спочатку видалити попередні записи для методу
    await pool.query('DELETE FROM compromise_rankings WHERE method = $1', [method]);

    // Потім вставити нові ранжування
    const insertQuery = `
      INSERT INTO compromise_rankings (method, song_id, position, sum_distance, max_distance)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const row of rankings) {
      const { song_id, position, sum_distance = null, max_distance = null } = row;
      await pool.query(insertQuery, [method, song_id, position, sum_distance, max_distance]);
    }

    res.status(201).json({ message: 'Компромісне ранжування збережено' });

  } catch (err) {
    console.error("❌ Помилка збереження компромісних ранжувань:", err.message, err.stack);
    res.status(500).json({ error: 'Помилка сервера', details: err.message });
  }
});



module.exports = router;
