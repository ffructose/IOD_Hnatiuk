const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,  // Стандартний порт PostgreSQL
  ssl: { rejectUnauthorized: false }  // Для підключення до Render
});

client.connect()
  .then(() => console.log('✅ Підключено до PostgreSQL'))
  .catch(err => console.error('❌ Помилка підключення:', err));

module.exports = client;

const createTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        level VARCHAR(50) NOT NULL DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS SongPlace (
        songplace_id SERIAL PRIMARY KEY,
        song_id INT NOT NULL,
        user_id INT NOT NULL,
        place INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES EuroSongs(song_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Protocol (
        protocol_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        action TEXT NOT NULL,
        time TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ); 

      CREATE TABLE IF NOT EXISTS evristics (
        evristic_id SERIAL PRIMARY KEY,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS evristicPlace (
        evristicplace_id SERIAL PRIMARY KEY,
        evristic_id INT NOT NULL,
        user_id INT NOT NULL,
        place INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (evristic_id) REFERENCES evristics(evristic_id) ON DELETE CASCADE
      );


      CREATE TABLE IF NOT EXISTS evrsongs (
        evrsongs_id SERIAL PRIMARY KEY,
        song_id INT NOT NULL,
        song_name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS compromise_rankings (
          ranking_id SERIAL PRIMARY KEY,
          method VARCHAR(50) NOT NULL,         -- 'E1' або 'E2'
          song_id INT NOT NULL,                -- ID пісні
          position INT NOT NULL,               -- ранг (1, 2, 3...)
          sum_distance INT,                    -- Σ відстаней (опціонально)
          max_distance INT,                    -- Макс відстань (опціонально)
          created_at TIMESTAMP DEFAULT NOW(),  -- дата створення
          FOREIGN KEY (song_id) REFERENCES EuroSongs(song_id) ON DELETE CASCADE
      );


    `;

  try {
    await client.query(query);
    console.log("✅ Таблиця 'users' створена або вже існує.");
  } catch (err) {
    console.error("❌ Помилка при створенні таблиці:", err);
  }
};

createTable();