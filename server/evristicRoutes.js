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

        for (const place of places) {
            // Отримуємо поточне місце евристики
            const currentPlaceRes = await client.query(
                "SELECT place FROM evristicPlace WHERE user_id = $1 AND evristic_id = $2",
                [user_id, place.evristic_id]
            );

            const currentPlace = currentPlaceRes.rows[0]?.place;

            // Оновлюємо місце тільки якщо воно змінилось
            if (currentPlace !== place.place) {
                await client.query(
                    "UPDATE evristicPlace SET place = $1 WHERE user_id = $2 AND evristic_id = $3",
                    [place.place, user_id, place.evristic_id]
                );

                // 🔹 Логування зміни в Protocol
                await client.query(
                    "INSERT INTO Protocol (user_id, action, time) VALUES ($1, $2, NOW())",
                    [user_id, `Користувач змінив місце евристики ID ${place.evristic_id} на ${place.place}`]
                );
            }
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

// Отримати найпопулярніші пісні
router.get("/popular-songs", async (req, res) => {
    try {
        const query = `
            SELECT 
                sp.song_id,
                e.song_name,
                e.author,
                e.country,
                COUNT(CASE WHEN sp.place = 1 THEN 1 END) AS first_place_count,
                COUNT(CASE WHEN sp.place = 2 THEN 1 END) AS second_place_count,
                COUNT(CASE WHEN sp.place = 3 THEN 1 END) AS third_place_count
            FROM SongPlace sp
            JOIN EuroSongs e ON sp.song_id = e.song_id
            GROUP BY sp.song_id, e.song_name, e.author, e.country
        `;

        const result = await client.query(query);

        // Використовуємо довільну функцію сортування
        const sortedSongs = sortPopularSongs(result.rows);

        res.json(sortedSongs);
    } catch (error) {
        console.error("❌ Помилка отримання популярних пісень:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// Довільна функція сортування пісень за популярністю
function sortPopularSongs(songs) {
    return songs.sort((a, b) => {
        const scoreA = a.first_place_count * 3 + a.second_place_count * 2 + a.third_place_count * 1;
        const scoreB = b.first_place_count * 3 + b.second_place_count * 2 + b.third_place_count * 1;
        return scoreB - scoreA; // Від найпопулярніших до менш популярних
    });
}
/**
 * 🔹 Отримання евристик за популярністю
 */
router.get("/popular", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT e.evristic_id, e.description,
                COUNT(CASE WHEN ep.place = 1 THEN 1 END) AS place_1,
                COUNT(CASE WHEN ep.place = 2 THEN 1 END) AS place_2,
                COUNT(CASE WHEN ep.place = 3 THEN 1 END) AS place_3,
                COUNT(CASE WHEN ep.place = 4 THEN 1 END) AS place_4,
                COUNT(CASE WHEN ep.place = 5 THEN 1 END) AS place_5,
                COUNT(CASE WHEN ep.place = 6 THEN 1 END) AS place_6,
                COUNT(CASE WHEN ep.place = 7 THEN 1 END) AS place_7
            FROM evristics e
            LEFT JOIN evristicPlace ep ON e.evristic_id = ep.evristic_id
            GROUP BY e.evristic_id, e.description
            ORDER BY place_1 DESC, place_2 DESC, place_3 DESC, place_4 DESC, place_5 DESC, place_6 DESC, place_7 DESC;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Помилка отримання популярності евристик:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// 🔁 Очищення та вставлення нових даних у EvrSongs
router.post("/evrsongs/reset", async (req, res) => {
    const { songs } = req.body;

    console.log("📩 Отримано список пісень:", songs);

    if (!Array.isArray(songs)) {
        return res.status(400).json({ error: "songs має бути масивом" });
    }

    try {
        await client.query("DELETE FROM EvrSongs");

        for (const song of songs) {
            console.log(`🎵 Вставка пісні:`, song);
            if (!song.songId || !song.songName) {
                console.log("⚠️ Пропущено через відсутність полів", song);
                continue;
            }

            await client.query(
                "INSERT INTO EvrSongs (song_id, song_name) VALUES ($1, $2)",
                [song.songId, song.songName]
            );
        }

        res.status(200).json({ message: "EvrSongs оновлено" });
    } catch (error) {
        console.error("❌ Помилка при оновленні EvrSongs:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});


// 📥 Отримати дані з EvrSongs
router.get("/evrsongs", async (req, res) => {
    try {
        const result = await client.query("SELECT song_name FROM EvrSongs");
        console.log("📤 Відправляю пісні з бази:", result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Помилка при отриманні EvrSongs:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
});


module.exports = router;
