
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [data, allowedSongIds] = await Promise.all([
      fetch('/lab3/song-places').then(r => r.json()),
      fetch('/lab3/evrsongs').then(r => r.json())
    ]);

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
    userIds.forEach(userId => {
      const th = document.createElement('th');
      th.textContent = userId;
      headerRow4.appendChild(th);
    });
    // Додаткові стовпці
    const sumTh = document.createElement('th');
    sumTh.textContent = 'Сума';
    headerRow4.appendChild(sumTh);

    const maxTh = document.createElement('th');
    maxTh.textContent = 'Макс';
    headerRow4.appendChild(maxTh);

    table4.appendChild(headerRow4);

    // Кожна перестановка — як ранг-вектор (0, 1, 2, ...)
    permutations.forEach((perm, idx) => {
      const row = document.createElement('tr');

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

        // Відстань Кука — як у Excel
        let distance = 0;
        for (let i = 0; i < expertRanks.length; i++) {
          const expertRank = expertRanks[i];        // з matrixRanks
          const songId = allSongIds[i];             // пісня на цій позиції
          const permRank = perm.indexOf(songId) + 1; // ранг у перестановці

          if (expertRank > 0 && permRank > 0) {
            distance += Math.abs(expertRank - permRank);
          }
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





    // Збірка даних для cont1_6 і cont1_7
    const cont6 = document.getElementById('cont1_6');
    const cont7 = document.getElementById('cont1_7');

    // 1️⃣ Пошук мінімумів у Σ та Макс
    let minSum = Infinity;
    let minMax = Infinity;

    let minSumPerms = [];
    let minMaxPerms = [];

    const resultRows = Array.from(table4.rows).slice(1); // пропускаємо заголовок

    resultRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const distances = Array.from(cells).slice(0, userIds.length).map(td => Number(td.textContent));
      const sum = Number(cells[userIds.length].textContent);
      const max = Number(cells[userIds.length + 1].textContent);

      const songIds = Array.from(allSongIds); // щоб зберегти оригінальний порядок
      const permutation = [...permutations[resultRows.indexOf(row)]];

      // Для суми
      if (sum < minSum) {
        minSum = sum;
        minSumPerms = [permutation];
      } else if (sum === minSum) {
        minSumPerms.push(permutation);
      }

      // Для максимуму
      if (max < minMax) {
        minMax = max;
        minMaxPerms = [permutation];
      } else if (max === minMax) {
        minMaxPerms.push(permutation);
      }
    });


    // 📊 Оновлена таблиця для cont1_6 — об'єднання minSumPerms + minMaxPerms без повторів
    const table6 = document.createElement('table');
    table6.border = "1";
    table6.style.borderCollapse = 'collapse';

    // Заголовок
    const headerRow6 = document.createElement('tr');
    const thLabel = document.createElement('th');
    thLabel.textContent = 'Категорія';
    headerRow6.appendChild(thLabel);
    allSongIds.forEach(songId => {
      const th = document.createElement('th');
      th.textContent = `ID ${songId}`;
      headerRow6.appendChild(th);
    });
    table6.appendChild(headerRow6);

    // Зберігаємо, що вже додали
    const seenPerms = new Set();

    // Додаємо унікальні з minSumPerms
    minSumPerms.forEach(perm => {
      const key = perm.join(',');
      if (!seenPerms.has(key)) {
        seenPerms.add(key);

        const row = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = `Сума: ${minSum}`;
        row.appendChild(tdLabel);

        allSongIds.forEach(songId => {
          const td = document.createElement('td');
          td.textContent = perm.indexOf(songId) + 1;
          row.appendChild(td);
        });

        table6.appendChild(row);
      }
    });

    // Додаємо унікальні з minMaxPerms
    minMaxPerms.forEach(perm => {
      const key = perm.join(',');
      if (!seenPerms.has(key)) {
        seenPerms.add(key);

        const row = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = `Макс: ${minMax}`;
        row.appendChild(tdLabel);

        allSongIds.forEach(songId => {
          const td = document.createElement('td');
          td.textContent = perm.indexOf(songId) + 1;
          row.appendChild(td);
        });

        table6.appendChild(row);
      }
    });

    cont6.appendChild(table6);


    // 🧩 Зібрати унікальні перестановки з minSumPerms і minMaxPerms для table7 та table8
    const mergedPermsMap = new Map();

    minSumPerms.forEach(perm => {
      mergedPermsMap.set(perm.join(','), perm);
    });
    minMaxPerms.forEach(perm => {
      mergedPermsMap.set(perm.join(','), perm);
    });

    const mergedPerms = Array.from(mergedPermsMap.values());



    // 📊 Таблиця ранжувань для cont1_7
    const table7 = document.createElement('table');
    table7.border = "1";
    table7.style.borderCollapse = 'collapse';

    // Заголовок
    const headerRow7 = document.createElement('tr');

    allSongIds.forEach(songId => {
      const th = document.createElement('th');
      th.textContent = `ID ${songId}`;
      headerRow7.appendChild(th);
    });
    table7.appendChild(headerRow7);

    // Рядки з рангами для кожної перестановки
    mergedPerms.forEach(perm => {

      const row = document.createElement('tr');

      allSongIds.forEach(songId => {
        const td = document.createElement('td');
        td.textContent = perm.indexOf(songId) + 1; // позиція + 1 = ранг
        row.appendChild(td);
      });

      table7.appendChild(row);
    });

    cont7.appendChild(table7);


    // 📌 cont1_8 — Результуючі ранжування за евристиками E1 та E2
    const cont8 = document.getElementById('cont1_8');
    const table8 = document.createElement('table');
    table8.border = "1";
    table8.style.borderCollapse = 'collapse';

    // Заголовок
    const headerRow8 = document.createElement('tr');
    const thLabel1 = document.createElement('th');
    thLabel1.textContent = 'Метод';
    headerRow8.appendChild(thLabel1);
    allSongIds.forEach(songId => {
      const th = document.createElement('th');
      th.textContent = `ID ${songId}`;
      headerRow8.appendChild(th);
    });
    const thSum = document.createElement('th');
    thSum.textContent = 'Σ відстаней';
    headerRow8.appendChild(thSum);
    const thMax = document.createElement('th');
    thMax.textContent = 'Макс відстань';
    headerRow8.appendChild(thMax);

    table8.appendChild(headerRow8);

    // Функція для обчислення відстаней Кука
    function calculateCookDistances(perm) {
      let sum = 0;
      let max = 0;

      for (let j = 0; j < userIds.length; j++) {
        const expertRanks = matrixRanks.map(r => r[j]); // ранги експерта j
        const permAsRanks = allSongIds.map(songId => perm.indexOf(songId) + 1);

        let distance = 0;
        for (let i = 0; i < expertRanks.length; i++) {
          distance += Math.abs(expertRanks[i] - permAsRanks[i]);
        }

        sum += distance;
        if (distance > max) max = distance;
      }

      return { sum, max };
    }

    // 🔍 Пошук найкращих перестановок за E1 і E2
    let bestE1 = null, bestE2 = null;
    let bestE1Value = Infinity, bestE2Value = Infinity;

    mergedPerms.forEach(perm => {
      const { sum, max } = calculateCookDistances(perm);

      if (sum < bestE1Value) {
        bestE1Value = sum;
        bestE1 = { perm, sum, max };
      }

      if (max < bestE2Value) {
        bestE2Value = max;
        bestE2 = { perm, sum, max };
      }
    });

    // 🖊️ Додаємо рядок для E1
    if (bestE1) {
      const row = document.createElement('tr');
      const label = document.createElement('td');
      label.textContent = 'Евристика E1 (мін. сума)';
      row.appendChild(label);

      allSongIds.forEach(songId => {
        const td = document.createElement('td');
        td.textContent = bestE1.perm.indexOf(songId) + 1;
        row.appendChild(td);
      });

      const tdSum = document.createElement('td');
      tdSum.textContent = bestE1.sum;
      row.appendChild(tdSum);

      const tdMax = document.createElement('td');
      tdMax.textContent = bestE1.max;
      row.appendChild(tdMax);

      table8.appendChild(row);
    }

    // 🖊️ Додаємо рядок для E2
    if (bestE2) {
      const row = document.createElement('tr');
      const label = document.createElement('td');
      label.textContent = 'Евристика E2 (мін. макс)';
      row.appendChild(label);

      allSongIds.forEach(songId => {
        const td = document.createElement('td');
        td.textContent = bestE2.perm.indexOf(songId) + 1;
        row.appendChild(td);
      });

      const tdSum = document.createElement('td');
      tdSum.textContent = bestE2.sum;
      row.appendChild(tdSum);

      const tdMax = document.createElement('td');
      tdMax.textContent = bestE2.max;
      row.appendChild(tdMax);

      table8.appendChild(row);
    }

    cont8.appendChild(table8);

    // ⏺️ Збереження компромісних ранжувань
    async function saveCompromise(method, data) {
      try {
        const response = await fetch("/lab3/compromise-rankings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            method: method,
            rankings: data
          })
        });

        if (!response.ok) {
          throw new Error("Помилка збереження ранжування");
        }

        console.log(`✅ Збережено результати для методу ${method}`);
      } catch (err) {
        console.error(`❌ Помилка при збереженні методу ${method}:`, err);
      }
    }

    // Підготовка і збереження E1
    if (bestE1) {
      const rankingsE1 = allSongIds.map(songId => ({
        song_id: songId,
        position: bestE1.perm.indexOf(songId) + 1,
        sum_distance: bestE1.sum,
        max_distance: bestE1.max
      }));
      await saveCompromise("E1", rankingsE1);
    }

    // Підготовка і збереження E2
    if (bestE2) {
      const rankingsE2 = allSongIds.map(songId => ({
        song_id: songId,
        position: bestE2.perm.indexOf(songId) + 1,
        sum_distance: bestE2.sum,
        max_distance: bestE2.max
      }));
      await saveCompromise("E2", rankingsE2);
    }

  } catch (error) {
    console.error('Помилка завантаження даних:', error);
  }

});


