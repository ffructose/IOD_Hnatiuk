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


      // 🧩 Матриця статистики: 4 рядки, стовпці — користувачі
      const matrixStats = [[], [], [], []];

      const table2 = document.createElement('table');
      table2.border = "1";
      table2.style.borderCollapse = 'collapse';

      // Заголовок
      const headerRow2 = document.createElement('tr');
      userIds.forEach(userId => {
        const th = document.createElement('th');
        th.textContent = userId;
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
        th.textContent = userId;
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


      // 🧩 4. Побудова таблиці перестановок пісень
      const cont5 = document.getElementById('cont1_5');
      const table5 = document.createElement('table');
      table5.border = "1";
      table5.style.borderCollapse = 'collapse';

      // Функція генерації перестановок (рекурсивна)
      function generatePermutations(arr) {
        const results = [];
        function permute(temp, remaining) {
          if (remaining.length === 0) {
            results.push(temp);
          } else {
            for (let i = 0; i < remaining.length; i++) {
              const next = remaining.slice();
              const curr = next.splice(i, 1);
              permute(temp.concat(curr), next);
            }
          }
        }
        permute([], arr);
        return results;
      }

      // Створити всі перестановки дозволених song_id
      const permutations = generatePermutations(allSongIds);

      // Побудувати заголовок
      const headerRow5 = document.createElement('tr');
      allSongIds.forEach((_, idx) => {
        const th = document.createElement('th');
        th.textContent = `Pos ${idx + 1}`;
        headerRow5.appendChild(th);
      });
      table5.appendChild(headerRow5);

      // Додати перестановки як рядки таблиці
      permutations.forEach(permutation => {
        const row = document.createElement('tr');
        permutation.forEach(songId => {
          const td = document.createElement('td');
          td.textContent = songId;
          row.appendChild(td);
        });
        table5.appendChild(row);
      });

      cont5.appendChild(table5);



      // 🧮 Обчислення відстаней Кука + сума та максимум
      const cont4 = document.getElementById('cont1_4');
      const table4 = document.createElement('table');
      table4.border = "1";
      table4.style.borderCollapse = 'collapse';

      // Заголовок
      const headerRow4 = document.createElement('tr');
      const firstTh = document.createElement('th');
      firstTh.textContent = 'Permutation';
      headerRow4.appendChild(firstTh);
      userIds.forEach(userId => {
        const th = document.createElement('th');
        th.textContent = `User ${userId}`;
        headerRow4.appendChild(th);
      });
      // Додаткові стовпці
      const sumTh = document.createElement('th');
      sumTh.textContent = 'Σ Відстаней';
      headerRow4.appendChild(sumTh);

      const maxTh = document.createElement('th');
      maxTh.textContent = 'Макс Відстань';
      headerRow4.appendChild(maxTh);

      table4.appendChild(headerRow4);

      // Кожна перестановка — як ранг-вектор (0, 1, 2, ...)
      permutations.forEach((perm, idx) => {
        const row = document.createElement('tr');

        const label = document.createElement('td');
        label.textContent = perm.join(', ');
        row.appendChild(label);

        let sum = 0;
        let max = 0;

        for (let j = 0; j < userIds.length; j++) {
          const expertRanks = matrixRanks.map(r => r[j]); // стовпець j

          // Створити вектор рангів для цієї перестановки
          const permAsRanks = [];
          for (let k = 0; k < expertRanks.length; k++) {
            const songId = allSongIds[k];
            const posInPerm = perm.indexOf(songId);
            permAsRanks.push(posInPerm + 1); // 1-based
          }

          // Відстань Кука
          let distance = 0;
          for (let i = 0; i < expertRanks.length; i++) {
            distance += Math.abs(expertRanks[i] - permAsRanks[i]);
          }

          sum += distance;
          if (distance > max) max = distance;

          const td = document.createElement('td');
          td.textContent = distance;
          row.appendChild(td);
        }

        // Додаємо підсумки
        const sumTd = document.createElement('td');
        sumTd.textContent = sum;
        row.appendChild(sumTd);

        const maxTd = document.createElement('td');
        maxTd.textContent = max;
        row.appendChild(maxTd);

        table4.appendChild(row);
      });

      cont4.appendChild(table4);



    })
    .catch(error => {
      console.error('Помилка завантаження даних:', error);
    });
});