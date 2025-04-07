document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Ви не авторизовані! Перенаправлення на вхід...");
      window.location.href = "login.html";
      return;
    }
  
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
  });
  