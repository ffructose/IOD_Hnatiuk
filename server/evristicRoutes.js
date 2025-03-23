const express = require("express");
const client = require("./db");
const router = express.Router();

/**
 * 1️⃣ Отримуємо евристики користувача (або створюємо початкові значення)
 */
router.get("/user/:user_id", async (req, res) => {
    const userId = req.params.user_id;

    try {
        // Перевіряємо, чи є записи для цього користувача в evristicPlace
        const existingRecords = await client.query("SELECT * FROM evristicPlace WHERE user_id = $1", [userId]);

        // Якщо записів немає, створюємо їх
        if (existingRecords.rows.length === 0) {
            const evristics = await client.query("SELECT * FROM evristics");
            for (const evristic of evristics.rows) {
                await client.query("INSERT INTO evristicPlace (evristic_id, user_id, place) VALUES ($1, $2, $3)",
                    [evristic.evristic_id, userId, evristic.evristic_id]);
            }
        }

        // Повертаємо оновлений список евристик користувача
        const userEvristics = await client.query(`
            SELECT evristicPlace.evristic_id, evristicPlace.place, evristics.description
            FROM evristicPlace
            JOIN evristics ON evristicPlace.evristic_id = evristics.evristic_id
            WHERE evristicPlace.user_id = $1
            ORDER BY evristicPlace.place ASC
        `, [userId]);

        res.json(userEvristics.rows);
    } catch (err) {
        console.error("❌ Помилка отримання евристик:", err);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

/**
 * 2️⃣ Оновлення порядку евристик
 */
router.post("/update", async (req, res) => {
    const { user_id, places } = req.body;

    if (!user_id || !places || !Array.isArray(places)) {
        return res.status(400).json({ error: "Неправильні дані" });
    }

    try {
        await client.query("BEGIN");

        // Видаляємо старі записи користувача
        await client.query("DELETE FROM evristicPlace WHERE user_id = $1", [user_id]);

        // Додаємо оновлені позиції
        for (const place of places) {
            await client.query(
                "INSERT INTO evristicPlace (evristic_id, user_id, place) VALUES ($1, $2, $3)",
                [place.evristic_id, user_id, place.place]
            );

            // 🔹 Логування кожної зміни в Protocol
            await client.query(
                "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
                [user_id, `Користувач змінив місце евристики ID ${place.evristic_id} на ${place.place}`]
            );
        }

        await client.query("COMMIT");
        res.json({ message: "✅ Порядок евристик оновлено" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Помилка оновлення евристик:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});


/**
 * 3️⃣ Логування дій користувача
 */
router.post("/log-action", async (req, res) => {
    const { user_id, action } = req.body;

    if (!user_id || !action) {
        return res.status(400).json({ error: "Неправильні дані" });
    }

    try {
        await client.query(
            "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
            [user_id, action]
        );
        res.json({ message: "✅ Дія записана у протокол" });
    } catch (error) {
        console.error("❌ Помилка логування дії:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

module.exports = router;
