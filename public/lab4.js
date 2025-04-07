document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
      window.location.href = "login.html";
      return;
    }
  
    // --- Завантаження голосування користувачів ---
    try {
      const response = await fetch("/lab4/songs-poll", {
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      if (!response.ok) throw new Error("Не вдалося отримати дані");
  
      const data = await response.json();
      const tableBody = document.querySelector("#songsPollTable tbody");
  
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
  