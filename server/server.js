const express = require('express');
const connection = require('./db');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());

// Реєстрація нового користувача
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  connection.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Реєстрація успішна' });
    }
  );
});

// Логін користувача
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ error: '❌ Невірні дані' });

      const user = results[0];
      if (bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: '❌ Невірний пароль' });
      }
    }
  );
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер працює на порту ${PORT}`));
