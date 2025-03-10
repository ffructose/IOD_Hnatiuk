const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const userRoutes = require('./songsRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Використання окремих файлів маршрутів
app.use('/auth', authRoutes);  // Рути авторизації
app.use('/user', userRoutes);  // Рути роботи з користувачем
app.use('/songs', songsRoutes);  // Рути роботи з списком пісень

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));
