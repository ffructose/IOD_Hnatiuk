document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userLevelSpan = document.getElementById("userLevel");
    const protocolContainer = document.getElementById("protocolContainer");
    const protocolTableBody = document.querySelector("#protocolTable tbody");
    const songsPollContainer = document.getElementById("songsPoll");
    const songsPollTableBody = document.querySelector("#songsPollTable tbody");
    const adminBlock = document.getElementById("adminBlock");
    const usersTableBody = document.querySelector("#usersTable tbody");
    const clearProtocolButton = document.getElementById("clearProtocolButton");

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

                fetch("/user/protocol", { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(protocolData => {
                    protocolTableBody.innerHTML = "";
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
                .catch(err => console.error("❌ Помилка завантаження протоколу:", err));

                // 🔹 Завантажуємо `songsPoll`
                songsPollContainer.style.display = "block";

                fetch("/user/songs-poll", { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(songsData => {
                    songsPollTableBody.innerHTML = "";
                    songsData.forEach(row => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${row.user_id}</td>
                            <td>${row.username}</td>
                            <td>${row.first_place || "❌ Немає даних"}</td>
                            <td>${row.second_place || "❌ Немає даних"}</td>
                            <td>${row.third_place || "❌ Немає даних"}</td>
                        `;
                        songsPollTableBody.appendChild(tr);
                    });
                })
                .catch(err => console.error("❌ Помилка завантаження голосування:", err));
            }

            // Якщо користувач адмін, показуємо `adminBlock`
            if (data.level === "admin") {
                adminBlock.style.display = "block";

                // Завантаження списку користувачів
                fetch("/admin/users", { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(users => {
                    usersTableBody.innerHTML = "";
                    users.forEach(user => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>
                                <select onchange="changeUserLevel(${user.id}, this.value)">
                                    <option value="user" ${user.level === "user" ? "selected" : ""}>User</option>
                                    <option value="teacher" ${user.level === "teacher" ? "selected" : ""}>Teacher</option>
                                    <option value="admin" ${user.level === "admin" ? "selected" : ""}>Admin</option>
                                </select>
                            </td>
                            <td><button onclick="deleteUser(${user.id})">❌ Видалити</button></td>
                        `;
                        usersTableBody.appendChild(tr);
                    });
                })
                .catch(err => console.error("❌ Помилка завантаження користувачів:", err));

                // Очищення протоколу
                clearProtocolButton.addEventListener("click", async () => {
                    if (confirm("⚠ Ви впевнені, що хочете очистити протокол?")) {
                        const response = await fetch("/admin/clear-protocol", {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });

                        if (response.ok) {
                            alert("✅ Протокол очищено!");
                            protocolTableBody.innerHTML = "";
                        } else {
                            alert("❌ Помилка очищення протоколу.");
                        }
                    }
                });
            }
        } else {
            logout();
        }
    })
    .catch(() => logout());
});

// Функція для зміни рівня доступу
async function changeUserLevel(userId, newLevel) {
    const token = localStorage.getItem("token");
    await fetch(`/admin/change-level/${userId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel })
    });
}

// Функція для видалення користувача
async function deleteUser(userId) {
    const token = localStorage.getItem("token");
    if (confirm("⚠ Ви впевнені, що хочете видалити цього користувача?")) {
        await fetch(`/admin/delete-user/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        alert("✅ Користувач видалений.");
        location.reload();
    }
}
