document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
        window.location.href = "login.html";
        return;
    }



    // --- Побудова таблиці в cont1_1 з назвами пісень ---
    try {
        const [songPlacesRes, songsRes] = await Promise.all([
            fetch("/lab4/song-places", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/lab4/evrsongs", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!songPlacesRes.ok || !songsRes.ok) {
            throw new Error("Не вдалося отримати дані");
        }

        const data = await songPlacesRes.json();  // { user_id: [songId1, songId2, songId3] }
        const songs = await songsRes.json();      // [{ song_id: 1, song_name: 'ABC' }, ...]

        const songIdToName = {};
        songs.forEach(song => {
            songIdToName[song.song_id] = song.song_name;
        });

        const cont1 = document.getElementById("cont1_1");

        const userIds = Object.keys(data);
        const table = document.createElement("table");
        table.border = "1";
        table.style.borderCollapse = "collapse";

        // Заголовок
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

        // Рядки для 1-3 місць
        const placeNames = ["1 місце", "2 місце", "3 місце"];
        for (let i = 0; i < 3; i++) {
            const row = document.createElement("tr");
            const placeCell = document.createElement("td");
            placeCell.textContent = placeNames[i];
            row.appendChild(placeCell);

            userIds.forEach(userId => {
                const td = document.createElement("td");
                const songId = data[userId]?.[i];
                td.textContent = songIdToName[songId] || "-";
                row.appendChild(td);
            });

            table.appendChild(row);
        }

        cont1.appendChild(table);
    } catch (err) {
        console.error("❌ Помилка при побудові таблиці:", err);
        document.getElementById("cont1_1").innerHTML += `<p style="color:red;">Помилка при завантаженні таблиці</p>`;
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
