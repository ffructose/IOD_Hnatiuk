document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Отримуємо дані з бекенду
      const response = await fetch("/lab4/songs-poll");
      if (!response.ok) throw new Error("Не вдалося отримати дані");
  
      const data = await response.json();
  
      const tableBody = document.querySelector("#songsPollTable tbody");
  
      // Заповнюємо таблицю
      data.forEach(row => {
        const tr = document.createElement("tr");
  
        tr.innerHTML = `
          <td>${row.user_id}</td>
          <td>${row.username}</td>
          <td>${row.first_place || "-"}</td>
          <td>${row.second_place || "-"}</td>
          <td>${row.third_place || "-"}</td>
        `;
  
        tableBody.appendChild(tr);
      });
    } catch (error) {
      console.error("❌ Помилка під час завантаження таблиці:", error);
      const tableBody = document.querySelector("#songsPollTable tbody");
      tableBody.innerHTML = `<tr><td colspan="5">Помилка при завантаженні даних</td></tr>`;
    }
  });
  