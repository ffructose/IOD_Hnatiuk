document.addEventListener("DOMContentLoaded", () => {
    fetch('/lab3/song-places')
      .then(response => response.json())
      .then(data => {
        const cont1 = document.getElementById('cont1_1');
        const cont2 = document.getElementById('cont1_2');
  
        // Створюємо таблицю 1 — відображення пісень на місцях
        const table1 = document.createElement('table');
        table1.border = "1";
        table1.style.borderCollapse = 'collapse';
  
        // Заголовок таблиці
        const headerRow = document.createElement('tr');
        for (const userId in data) {
          const th = document.createElement('th');
          th.textContent = `User ${userId}`;
          headerRow.appendChild(th);
        }
        table1.appendChild(headerRow);
  
        // 3 рядки (1, 2, 3 місця)
        for (let i = 0; i < 3; i++) {
          const row = document.createElement('tr');
          for (const userId in data) {
            const td = document.createElement('td');
            td.textContent = data[userId][i] || '';
            row.appendChild(td);
          }
          table1.appendChild(row);
        }
  
        cont1.appendChild(table1);
  
        // 📊 Таблиця 2 — статистика переваг
        const table2 = document.createElement('table');
        table2.border = "1";
        table2.style.borderCollapse = 'collapse';
  
        // Заголовок таблиці
        const headerRow2 = document.createElement('tr');
        for (const userId in data) {
          const th = document.createElement('th');
          th.textContent = `User ${userId}`;
          headerRow2.appendChild(th);
        }
        table2.appendChild(headerRow2);
  
        // Підготовка: створити map для швидкого підрахунку кількості пісень на кожному місці
        const placeMaps = [{}, {}, {}]; // 0 - 1 місце, 1 - 2 місце, 2 - 3 місце
  
        for (const userId in data) {
          for (let i = 0; i < 3; i++) {
            const songId = data[userId][i];
            if (!placeMaps[i][songId]) {
              placeMaps[i][songId] = 0;
            }
            placeMaps[i][songId]++;
          }
        }
  
        // 3 рядки — для кожного місця
        for (let i = 0; i < 3; i++) {
          const row = document.createElement('tr');
          for (const userId in data) {
            const songId = data[userId][i];
            const td = document.createElement('td');
            td.textContent = songId ? placeMaps[i][songId] : '';
            row.appendChild(td);
          }
          table2.appendChild(row);
        }
  
        // 4 рядок — сума по кожному користувачу
        const sumRow = document.createElement('tr');
        for (const userId in data) {
          let sum = 0;
          for (let i = 0; i < 3; i++) {
            const songId = data[userId][i];
            if (songId && placeMaps[i][songId]) {
              sum += placeMaps[i][songId];
            }
          }
          const td = document.createElement('td');
          td.textContent = sum;
          sumRow.appendChild(td);
        }
        table2.appendChild(sumRow);
  
        cont2.appendChild(table2);
      })
      .catch(error => {
        console.error('Помилка завантаження даних:', error);
      });
  });
  