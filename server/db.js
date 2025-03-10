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
      CREATE TABLE IF NOT EXISTS EuroSongs (
        song_id INT AUTO_INCREMENT PRIMARY KEY,
        song_name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL
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