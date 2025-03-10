document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userLevelSpan = document.getElementById("userLevel");
    const logoutButton = document.getElementById("logoutButton");
    const protocolContainer = document.getElementById("protocolContainer");
    const protocolTableBody = document.querySelector("#protocolTable tbody");

    if (!token) {
        alert("❌ Ви не авторизовані!");
        window.location.href = "login.html";
        return;
    }

    // Запит на сервер, щоб отримати рівень доступу користувача
    fetch("/user/info", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.username) {
            userLevelSpan.textContent = data.level;

            // Якщо користувач admin або teacher, завантажуємо таблицю `Protocol`
            if (data.level === "admin" || data.level === "teacher") {
                protocolContainer.style.display = "block"; // Показуємо контейнер

                fetch("/user/protocol", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(protocolData => {
                    protocolTableBody.innerHTML = ""; // Очищаємо перед оновленням
                    protocolData.forEach(row => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${row.protocol_id}</td>
                            <td>${row.user_id}</td>
                            <td>${row.action}</td>
                            <td>${new Date(row.time).toLocaleString()}</td>
                        `;
                        protocolTableBody.appendChild(tr);
                    });
                })
                .catch(err => console.error("Помилка завантаження протоколу:", err));
            }
        } else {
            logout();
        }
    })
    .catch(() => logout());

    // Вихід з аккаунта
    logoutButton.addEventListener("click", logout);
});

function logout() {
    localStorage.removeItem("token");
    alert("❌ Ви вийшли з акаунту!");
    window.location.href = "index.html";
}
