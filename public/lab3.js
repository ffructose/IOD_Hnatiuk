document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch('/lab3/song-places').then(r => r.json()),
    fetch('/lab3/evrsongs').then(r => r.json())
  ])
    .then(([data, allowedSongIds]) => {

      const cont1 = document.getElementById('cont1_1');
      const cont2 = document.getElementById('cont1_2');

      // Отримуємо userIds у тому порядку, як в об'єкті
      const userIds = Object.keys(data);

      // 🧩 Матриця пісень: 3 рядки (місця), стовпці — користувачі
      const matrixSongs = [[], [], []];

      const table1 = document.createElement('table');
      table1.border = "1";
      table1.style.borderCollapse = 'collapse';

      // Заголовок
      const headerRow1 = document.createElement('tr');
      userIds.forEach(userId => {
        const th = document.createElement('th');
        th.textContent = `User ${userId}`;
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
          if (allowedSongIds.includes(Number(songId))) {
            if (!placeMaps[i][songId]) {
              placeMaps[i][songId] = 0;
            }
            placeMaps[i][songId]++;
          }
          
        }
      });

      // 🧩 Матриця статистики: 4 рядки, стовпці — користувачі
      const matrixStats = [[], [], [], []];

      const table2 = document.createElement('table');
      table2.border = "1";
      table2.style.borderCollapse = 'collapse';

      // Заголовок
      const headerRow2 = document.createElement('tr');
      userIds.forEach(userId => {
        const th = document.createElement('th');
        th.textContent = `User ${userId}`;
        headerRow2.appendChild(th);
      });
      table2.appendChild(headerRow2);

      // 3 рядки — для кожного місця
      for (let i = 0; i < 3; i++) {
        const row = document.createElement('tr');
        userIds.forEach(userId => {
          const songId = data[userId][i];
          const count = songId ? placeMaps[i][songId] : '';
          matrixStats[i].push(count);
          const td = document.createElement('td');
          td.textContent = count;
          row.appendChild(td);
        });
        table2.appendChild(row);
      }

      // 4 рядок — сума по кожному користувачу
      const sumRow = document.createElement('tr');
      userIds.forEach(userId => {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
          const songId = data[userId][i];
          if (songId && placeMaps[i][songId]) {
            sum += placeMaps[i][songId];
          }
        }
        matrixStats[3].push(sum);
        const td = document.createElement('td');
        td.textContent = sum;
        sumRow.appendChild(td);
      });
      table2.appendChild(sumRow);

      cont2.appendChild(table2);

      // 🔍 Перевіримо в консолі
      console.log("matrixSongs (пісні):", matrixSongs);
      console.log("matrixStats (статистика):", matrixStats);

      // Тепер можна використовувати matrixSongs і matrixStats для подальших обчислень

      // 🧮 Матриця ранжування
      const cont3 = document.getElementById('cont1_3');
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
      const allSongIds = Array.from(allSongIdsSet)
      .filter(songId => allowedSongIds.includes(songId))
      .sort((a, b) => a - b);
    
      // 2. Побудова header-рядка
      const headerRow3 = document.createElement('tr');
      const emptyHeader = document.createElement('th');
      emptyHeader.textContent = 'Song ID';
      headerRow3.appendChild(emptyHeader);
      userIds.forEach(userId => {
        const th = document.createElement('th');
        th.textContent = `User ${userId}`;
        headerRow3.appendChild(th);
      });
      table3.appendChild(headerRow3);

      // 3. Створити матрицю ранжування
      const matrixRanks = []; // [ [songId, ...userValues], ... ]

      allSongIds.forEach(songId => {
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

        matrixRanks.push(songRow); // тільки значення, без songId
        table3.appendChild(row);
      });

      cont3.appendChild(table3);

      // 👀 Debug
      console.log("matrixRanks (ранги за множинними порівняннями):", matrixRanks);




    })
    .catch(error => {
      console.error('Помилка завантаження даних:', error);
    });
});