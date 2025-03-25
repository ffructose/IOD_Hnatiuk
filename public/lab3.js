document.addEventListener("DOMContentLoaded", () => {
    fetch('/lab3/song-places')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('cont1.1');
  
        // Створюємо таблицю
        const table = document.createElement('table');
        table.border = "1";
        table.style.borderCollapse = 'collapse';
  
        // Заголовок таблиці (рядок з user_id)
        const headerRow = document.createElement('tr');
        for (const userId in data) {
          const th = document.createElement('th');
          th.textContent = `User ${userId}`;
          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
  
        // Додаємо 3 рядки (1, 2, 3 місця)
        for (let i = 0; i < 3; i++) {
          const row = document.createElement('tr');
          for (const userId in data) {
            const td = document.createElement('td');
            td.textContent = data[userId][i] || '';
            row.appendChild(td);
          }
          table.appendChild(row);
        }
  
        container.appendChild(table);
      })
      .catch(error => {
        console.error('Помилка завантаження даних:', error);
      });
  });
  