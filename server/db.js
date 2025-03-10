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
      ALTER TABLE users ADD COLUMN full_name TEXT;
      ALTER TABLE users ADD COLUMN level VARCHAR(20) DEFAULT 'user';
      UPDATE users SET level = 'admin' WHERE username = 'ffructose';
    `;

  try {
    await client.query(query);
    console.log("✅ Таблиця 'users' створена або вже існує.");
  } catch (err) {
    console.error("❌ Помилка при створенні таблиці:", err);
  }
};

createTable();