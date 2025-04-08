document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
        window.location.href = "login.html";
        return;
    }

    let userIds = [];
    let matrixRanks = [];
    let allExpertSongIds = [];
    let allCompromiseSongIds = [];
    let R_star = [];
    let matrixSongs = [[], [], []]; // 🔥 глобальна змінна
    let data = {};

    // --- Побудова таблиці в cont2_1 з song_id ---
    try {
        const [songPlacesRes, evrsongsRes] = await Promise.all([
            fetch("/lab4/song-places", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/lab4/evrsongs", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!songPlacesRes.ok || !evrsongsRes.ok) {
            throw new Error("Не вдалося отримати дані");
        }

        data = await songPlacesRes.json();
        const allowedSongIds = await evrsongsRes.json(); // [1, 2, 3, ...]

        const cont1 = document.getElementById('cont2_1');
        userIds = Object.keys(data);

        // 🔁 Побудова allExpertSongIds і matrixRanks (так само, як у lab3.js)
        const allSongIdsSet = new Set();
        userIds.forEach(userId => {
            const places = data[userId];
            places.forEach(songId => {
                if (allowedSongIds.includes(Number(songId))) {
                    allSongIdsSet.add(Number(songId));
                }
            });
        });
        allExpertSongIds = Array.from(allSongIdsSet).sort((a, b) => a - b);

        matrixRanks = allExpertSongIds.map(songId => {
            return userIds.map(userId => {
                const places = data[userId];
                const idx = places.indexOf(songId);
                return idx === -1 ? 0 : idx + 1;
            });
        });
        console.log("✅ matrixRanks:", matrixRanks);
        console.log("✅ allExpertSongIds :", allExpertSongIds);



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
        document.getElementById("cont2_1").innerHTML += `<p style="color:red;">Помилка при завантаженні таблиці</p>`;
    }

    // --- Завантаження TWOfilteredTable з назвами пісень ---
    try {
        const TWOfilteredTableBody = document.querySelector("#TWOfilteredTable tbody");

        const response = await fetch("/lab4/songnames", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Не вдалося отримати список пісень");

        const songNames = await response.json(); // ['Пісня 1', 'Пісня 2', ...]

        TWOfilteredTableBody.innerHTML = "";
        songNames.forEach(name => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${name}</td>`;
            TWOfilteredTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Помилка при завантаженні TWOfilteredTable:", error);
        const TWOfilteredTableBody = document.querySelector("#TWOfilteredTable tbody");
        TWOfilteredTableBody.innerHTML = `<tr><td colspan="1">Помилка при завантаженні</td></tr>`;
    }

    // --- 📊 Завантаження компромісних ранжувань (E1 та E2) ---
    try {
        const compromiseData = await fetch("/lab4/compromise-rankings", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        const cont3 = document.getElementById('cont2_3');
        const table = document.createElement('table');
        table.border = "1";
        table.style.borderCollapse = "collapse";

        // 🔠 Заголовок
        const headerRow = document.createElement("tr");
        const thMethod = document.createElement("th");
        thMethod.textContent = "Метод";
        headerRow.appendChild(thMethod);

        // Витягуємо унікальні song_id
        allCompromiseSongIds = [...new Set([...compromiseData.E1, ...compromiseData.E2].map(row => row.song_id))].sort((a, b) => a - b);

        allCompromiseSongIds.forEach(songId => {
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

            allCompromiseSongIds.forEach(songId => {
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

            allCompromiseSongIds.forEach(songId => {
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

        if (compromiseData.E1?.length) {
            const cont7 = document.getElementById("cont2_7");

            const A_star = allCompromiseSongIds; // 🧠 просто копіюємо порядок із заголовку
            R_star = allCompromiseSongIds.map(songId => {
                const entry = compromiseData.E1.find(r => r.song_id === songId);
                return entry?.position ?? "-";
            });

            const table = document.createElement("table");
            table.border = "1";
            table.style.borderCollapse = "collapse";

            // 🔠 A* — перший рядок
            const rowA = document.createElement("tr");
            const thA = document.createElement("th");
            thA.textContent = "A* (song_id)";
            rowA.appendChild(thA);
            A_star.forEach(songId => {
                const td = document.createElement("td");
                td.textContent = songId;
                rowA.appendChild(td);
            });
            table.appendChild(rowA);

            // 🔢 R* — другий рядок
            const rowR = document.createElement("tr");
            const thR = document.createElement("th");
            thR.textContent = "R* (rank)";
            rowR.appendChild(thR);
            R_star.forEach(rank => {
                const td = document.createElement("td");
                td.textContent = rank;
                rowR.appendChild(td);
            });
            table.appendChild(rowR);

            cont7.appendChild(table);
        }

        // 🧮 Матриця ранжування
        if (compromiseData.E1?.length) {
            const cont4 = document.getElementById('cont2_4');
            const table3 = document.createElement('table');
            table3.border = "1";
            table3.style.borderCollapse = 'collapse';

            // 1. Зібрати всі унікальні song_id з matrixSongs
            const allSongIdsSet = new Set();
            matrixSongs.forEach(row => {
                row.forEach(songId => {
                    if (songId) allSongIdsSet.add(Number(songId));
                });
            });
            const localAllSongIds = Array.from(allSongIdsSet)
                .filter(songId => allCompromiseSongIds.includes(songId))
                .sort((a, b) => a - b);

            // 2. Побудова header-рядка
            const headerRow3 = document.createElement('tr');
            const emptyHeader = document.createElement('th');
            emptyHeader.textContent = 'Song ID';
            headerRow3.appendChild(emptyHeader);
            userIds.forEach(userId => {
                const th = document.createElement('th');
                th.textContent = userId;
                headerRow3.appendChild(th);
            });
            table3.appendChild(headerRow3);

            // 3. Створити матрицю ранжування
            matrixRanks = [];

            localAllSongIds.forEach(songId => {
                const row = document.createElement('tr');
                const labelCell = document.createElement('td');
                labelCell.textContent = songId;
                row.appendChild(labelCell);

                const songRow = [];

                userIds.forEach(userId => {
                    let value = 0;
                    for (let place = 0; place < 3; place++) {
                        if (Number(data[userId][place]) === songId) {
                            value = place + 1;
                            break;
                        }
                    }
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                    songRow.push(value);
                });

                matrixRanks.push(songRow);
                table3.appendChild(row);
            });

            cont4.appendChild(table3);

            // Задаємо новий R_star на основі компромісу (важливо!)
            R_star = localAllSongIds.map(songId => {
                const entry = compromiseData.E1.find(r => r.song_id === songId);
                return entry?.position ?? 0;
            });
        }


        // --- 📏 Відстані d^j ---
        const cont5 = document.getElementById("cont2_5");
        const table5 = document.createElement("table");
        table5.border = "1";
        table5.style.borderCollapse = "collapse";

        // Заголовок
        const headerRow5 = document.createElement("tr");
        const thUser5 = document.createElement("th");
        thUser5.textContent = "Експерт";
        const thDist5 = document.createElement("th");
        thDist5.textContent = "Відстань d^j";
        headerRow5.appendChild(thUser5);
        headerRow5.appendChild(thDist5);
        table5.appendChild(headerRow5);

        userIds.forEach((userId, j) => {
            const Aj = data[userId].map(id => Number(id)); // 3 пісні, які вибрав експерт
            const Rj = Aj.map(songId => {
                const rowIndex = allCompromiseSongIds.indexOf(songId);
                return rowIndex !== -1 ? matrixRanks[rowIndex][j] : 0;
            });
        
            const RstarLocal = Aj.map(songId => {
                const entry = compromiseData.E1.find(r => r.song_id === songId);
                return entry?.position ?? 0;
            });
        
            // Перевірка: скільки об'єктів не знайдено
            const missingCount = Rj.filter((val, idx) => val === 0 || RstarLocal[idx] === 0).length;
        
            let dj = 0;
            for (let i = 0; i < Aj.length; i++) {
                if (Rj[i] !== 0 && RstarLocal[i] !== 0) {
                    dj += Math.abs(Rj[i] - RstarLocal[i]);
                }
            }
        
            if (missingCount > 0) {
                dj = dj + allCompromiseSongIds.length - 3;
            }
        
            console.log(`🧑 Експерт ${userId}`);
            console.log("  Aj (обрані пісні):", Aj);
            console.log("  Rj (ранги експерта):", Rj);
            console.log("  R* (ранги у компромісі):", RstarLocal);
            console.log("  dj:", dj);
        
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userId}</td>
                <td>${dj}</td>
            `;
            table5.appendChild(row);
        });
        

        cont5.appendChild(table5);



        // --- 😌 Індекси задоволеності s^j ---
        const cont6 = document.getElementById("cont2_6");
        const table6 = document.createElement("table");
        table6.border = "1";
        table6.style.borderCollapse = "collapse";

        // Заголовок
        const headerRow6 = document.createElement("tr");
        const thUser6 = document.createElement("th");
        thUser6.textContent = "Експерт";
        const thSat6 = document.createElement("th");
        thSat6.textContent = "Індекс задоволеності s^j (%)";
        headerRow6.appendChild(thUser6);
        headerRow6.appendChild(thSat6);
        table6.appendChild(headerRow6);

        // n — кількість об’єктів у компромісному ранжуванні
        const n = R_star.length;
        const maxDistance = (n - 3) / 3;

        userIds.forEach((userId, j) => {
            const Rj = matrixRanks.map(row => row[j]);
            let dj = 0;

            for (let i = 0; i < R_star.length; i++) {
                if (Rj[i] !== 0) {
                    dj += Math.abs(Rj[i] - R_star[i]);
                }
            }

            const missingCount = Rj.filter(v => v === 0).length;
            if (missingCount > 0) {
                dj += n - 3;
            }

            const sj = (1 - (dj / maxDistance)) * 100;

            const row = document.createElement("tr");
            const tdUser = document.createElement("td");
            tdUser.textContent = userId;
            const tdSj = document.createElement("td");
            tdSj.textContent = sj.toFixed(2);
            row.appendChild(tdUser);
            row.appendChild(tdSj);
            table6.appendChild(row);
        });

        cont6.appendChild(table6);



    } catch (error) {
        console.error("❌ Помилка при завантаженні компромісів:", error);
        document.getElementById("cont2_3").innerHTML += `<p style="color:red;">шось десь якась помилка</p>`;
    }






});
