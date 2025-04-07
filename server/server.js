const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const songsRoutes = require('./songsRoutes');
const mainRoutes = require('./mainRoutes');
const adminRoutes = require('./adminRoutes');
const evristicRoutes = require('./evristicRoutes');
const lab3Routes = require('./lab3Routes');
const lab4Routes = require('./lab4Routes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Використання окремих файлів маршрутів
app.use('/auth', authRoutes);  // Рути авторизації
app.use('/user', userRoutes);  // Рути роботи з користувачем
app.use('/songs', songsRoutes);  // Рути роботи з списком пісень
app.use('/main', mainRoutes);  // Рути роботи з головною сторінкою
app.use('/admin', adminRoutes);  // Рути роботи з головною сторінкою
app.use('/evristics', evristicRoutes);  // Рути роботи з евристиками
app.use('/lab3', lab3Routes);  // Рути роботи з лаб3
app.use('/lab4', lab4Routes);  // Рути роботи з лаб4

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер працює на порту ${PORT}`));
