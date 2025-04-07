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
});
