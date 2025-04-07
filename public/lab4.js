document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
        window.location.href = "login.html";
        return;
    }

    // --- Завантаження таблиці з місцями для cont1_1 (userId × 3 місця) ---
    try {
        const [songPlacesRes, allowedSongsRes] = await Promise.all([
            fetch("/lab4/song-places", { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("/lab4/evrsongs", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (!songPlacesRes.ok || !allowedSongsRes.ok) {
            throw new Error("Не вдалося отримати song-places або evrsongs");
        }

        const data = await songPlacesRes.json();         // { user_id: [songId1, songId2, songId3] }
        const allowedSongIds = await allowedSongsRes.json();  // [101, 102, ...]

        const cont1 = document.getElementById("cont1_1");

        // --- Побудова таблиці ---
        const userIds = Object.keys(data);
        const table = document.createElement("table");
        table.border = "1";
        table.style.borderCollapse = "collapse";

        // Заголовок таблиці
        const headerRow = document.createElement("tr");
        const firstTh = document.createElement("th");
        firstTh.textContent = "Місце / Користувач";
        headerRow.appendChild(firstTh);
        userIds.forEach(userId => {
            const th = document.createElement("th");
            th.textContent = userId;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Тіло таблиці — місця (рядки)
        const placeNames = ["1 місце", "2 місце", "3 місце"];
        for (let i = 0; i < 3; i++) {
            const row = document.createElement("tr");
            const placeCell = document.createElement("td");
            placeCell.textContent = placeNames[i];
            row.appendChild(placeCell);

            userIds.forEach(userId => {
                const td = document.createElement("td");
                const songId = data[userId]?.[i];

                if (allowedSongIds.includes(Number(songId))) {
                    td.textContent = songId;
                } else {
                    td.textContent = "-";
                }

                row.appendChild(td);
            });

            table.appendChild(row);
        }

        cont1.appendChild(table);

    } catch (err) {
        console.error("❌ Помилка при завантаженні таблиці місць:", err);
        const cont1 = document.getElementById("cont1_1");
        cont1.innerHTML += `<p style="color:red;">Помилка при завантаженні множинних порівнянь</p>`;
    }


    // --- Завантаження filteredTable ---
    try {
        const filteredTableBody = document.querySelector("#filteredTable tbody");

        const response = await fetch("/lab4/evrsongs", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Не вдалося отримати список пісень");

        const songNames = await response.json();

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
});
