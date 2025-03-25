document.addEventListener("DOMContentLoaded", () => {
    fetch('/lab3/song-places')
      .then(response => response.json())
      .then(data => {
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
            matrixSongs[i].push(songId);
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
            if (!placeMaps[i][songId]) {
              placeMaps[i][songId] = 0;
            }
            placeMaps[i][songId]++;
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
      })
      .catch(error => {
        console.error('Помилка завантаження даних:', error);
      });
  });
  