document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
        window.location.href = "login.html";
        return;
    }

    // --- Побудова таблиці в cont1_1 з song_id ---
    try {
        const [songPlacesRes, evrsongsRes] = await Promise.all([
            fetch("/lab4/song-places", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/lab4/evrsongs", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!songPlacesRes.ok || !evrsongsRes.ok) {
            throw new Error("Не вдалося отримати дані");
        }

        const data = await songPlacesRes.json();         // { user_id: [song_id, song_id, song_id] }
        const allowedSongIds = await evrsongsRes.json(); // [1, 2, 3, ...]

        const cont1 = document.getElementById('cont1_1');
        const userIds = Object.keys(data);
        const matrixSongs = [[], [], []];

        const table1 = document.createElement('table');
        table1.border = "1";
        table1.style.borderCollapse = 'collapse';

        // Заголовок
        const headerRow1 = document.createElement('tr');
        userIds.forEach(userId => {
            const th = document.createElement('th');
            th.textContent = userId;
            headerRow1.appendChild(th);
        });
        table1.appendChild(headerRow1);

        // 3 рядки (місця)
        for (let i = 0; i < 3; i++) {
            const row = document.createElement('tr');
            userIds.forEach(userId => {
                const songId = data[userId][i] || '';
                if (allowedSongIds.includes(Number(songId))) {
                    matrixSongs[i].push(songId);
                } else {
                    matrixSongs[i].push('');
                }

                const td = document.createElement('td');
                td.textContent = songId;
                row.appendChild(td);
            });
            table1.appendChild(row);
        }

        cont1.appendChild(table1);

        // 🧮 Статистика: скільки разів кожна пісня на тому ж місці
        const placeMaps = [{}, {}, {}]; // для місць 1, 2, 3

        userIds.forEach(userId => {
            for (let i = 0; i < 3; i++) {
                const songId = data[userId][i];
                if (songId) { // ❗️ Прибираємо перевірку на allowedSongIds
                    if (!placeMaps[i][songId]) {
                        placeMaps[i][songId] = 0;
                    }
                    placeMaps[i][songId]++;
                }
            }
        });

        console.log("📊 Частота появи пісень:", placeMaps);

    } catch (err) {
        console.error("❌ Помилка при побудові таблиці:", err);
        document.getElementById("cont1_1").innerHTML += `<p style="color:red;">Помилка при завантаженні таблиці</p>`;
    }

    // --- Завантаження filteredTable з назвами пісень ---
    try {
        const filteredTableBody = document.querySelector("#filteredTable tbody");

        const response = await fetch("/lab4/songnames", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Не вдалося отримати список пісень");

        const songNames = await response.json(); // ['Пісня 1', 'Пісня 2', ...]

        filteredTableBody.innerHTML = "";
        songNames.forEach(name => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${name}</td>`;
            filteredTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Помилка при завантаженні filteredTable:", error);
        const filteredTableBody = document.querySelector("#filteredTable tbody");
        filteredTableBody.innerHTML = `<tr><td colspan="1">Помилка при завантаженні</td></tr>`;
    }

    // --- 📊 Завантаження компромісних ранжувань (E1 та E2) ---
    try {
        const compromiseData = await fetch("/lab4/compromise-rankings", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        const cont3 = document.getElementById('cont1_3');
        const table = document.createElement('table');
        table.border = "1";
        table.style.borderCollapse = "collapse";

        // 🔠 Заголовок
        const headerRow = document.createElement("tr");
        const thMethod = document.createElement("th");
        thMethod.textContent = "Метод";
        headerRow.appendChild(thMethod);

        // Витягуємо унікальні song_id
        const allSongIds = [...new Set([...compromiseData.E1, ...compromiseData.E2].map(row => row.song_id))].sort((a, b) => a - b);

        allSongIds.forEach(songId => {
            const th = document.createElement("th");
            th.textContent = `ID ${songId}`;
            headerRow.appendChild(th);
        });

        const thSum = document.createElement("th");
        thSum.textContent = "Σ відстаней";
        headerRow.appendChild(thSum);

        const thMax = document.createElement("th");
        thMax.textContent = "Макс відстань";
        headerRow.appendChild(thMax);

        table.appendChild(headerRow);

        // 📌 Додаємо рядок для E1
        if (compromiseData.E1?.length) {
            const row = document.createElement("tr");
            const tdLabel = document.createElement("td");
            tdLabel.textContent = "Евристика E1 (мін. сума)";
            row.appendChild(tdLabel);

            allSongIds.forEach(songId => {
                const entry = compromiseData.E1.find(r => r.song_id === songId);
                const td = document.createElement("td");
                td.textContent = entry ? entry.position : "-";
                row.appendChild(td);
            });

            const tdSum = document.createElement("td");
            tdSum.textContent = compromiseData.E1[0]?.sum_distance ?? "-";
            row.appendChild(tdSum);

            const tdMax = document.createElement("td");
            tdMax.textContent = compromiseData.E1[0]?.max_distance ?? "-";
            row.appendChild(tdMax);

            table.appendChild(row);
        }

        // 📌 Додаємо рядок для E2
        if (compromiseData.E2?.length) {
            const row = document.createElement("tr");
            const tdLabel = document.createElement("td");
            tdLabel.textContent = "Евристика E2 (мін. макс)";
            row.appendChild(tdLabel);

            allSongIds.forEach(songId => {
                const entry = compromiseData.E2.find(r => r.song_id === songId);
                const td = document.createElement("td");
                td.textContent = entry ? entry.position : "-";
                row.appendChild(td);
            });

            const tdSum = document.createElement("td");
            tdSum.textContent = compromiseData.E2[0]?.sum_distance ?? "-";
            row.appendChild(tdSum);

            const tdMax = document.createElement("td");
            tdMax.textContent = compromiseData.E2[0]?.max_distance ?? "-";
            row.appendChild(tdMax);

            table.appendChild(row);
        }

        cont3.appendChild(table);

        // 🧮 Побудова векторів A* та R* (для методу E1)
        if (compromiseData.E1?.length) {
            const cont4 = document.getElementById("cont1_4");

            // 🔠 A* — вектор об’єктів (song_id), відсортованих за position
            const sortedE1 = [...compromiseData.E1].sort((a, b) => a.position - b.position);
            const A_star = sortedE1.map(r => r.song_id);

            // 🔢 R* — вектор рангів: кожному song_id відповідає position
            const R_star = allSongIds.map(songId => {
                const entry = compromiseData.E1.find(r => r.song_id === songId);
                return entry?.position ?? "-";
            });

            // 📤 Вивід A*
            const pA = document.createElement("p");
            pA.innerHTML = `<strong>A*:</strong> (${A_star.join(", ")})`;
            cont4.appendChild(pA);

            // 📤 Вивід R*
            const pR = document.createElement("p");
            pR.innerHTML = `<strong>R*:</strong> (${R_star.join(", ")})`;
            cont4.appendChild(pR);
        }

    } catch (error) {
        console.error("❌ Помилка при завантаженні компромісів:", error);
        document.getElementById("cont1_3").innerHTML += `<p style="color:red;">Не вдалося завантажити компромісні ранжування</p>`;
    }




});
