document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userLevelSpan = document.getElementById("userLevel");
    const adminBlock = document.getElementById("adminBlock");
    const protocolContainer = document.getElementById("protocolContainer");
    const songsPollContainer = document.getElementById("songsPoll");
    const protocolTableBody = document.querySelector("#protocolTable tbody");
    const songsPollTableBody = document.querySelector("#songsPollTable tbody");
    const usersTableBody = document.querySelector("#usersTable tbody");
    const songsTableBody = document.querySelector("#songsTable tbody");

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

            // 🔹 Якщо користувач admin або teacher, завантажуємо таблиці `Protocol` та `songsPoll`
            if (data.level === "admin" || data.level === "teacher") {
                protocolContainer.style.display = "block"; 
                songsPollContainer.style.display = "block"; 

                fetch("/user/protocol", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
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
                });

                fetch("/user/songs-poll", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
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
                });
            }

            // 🔹 Якщо користувач admin, відкриваємо `adminBlock`
            if (data.level === "admin") {
                adminBlock.style.display = "block";

                // Отримуємо список користувачів
                fetch("/admin/users", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(usersData => {
                    usersTableBody.innerHTML = ""; 
                    usersData.forEach(user => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>
                                <select data-user-id="${user.id}">
                                    <option value="user" ${user.level === "user" ? "selected" : ""}>User</option>
                                    <option value="teacher" ${user.level === "teacher" ? "selected" : ""}>Teacher</option>
                                    <option value="admin" ${user.level === "admin" ? "selected" : ""}>Admin</option>
                                </select>
                            </td>
                            <td><button onclick="deleteUser(${user.id})">Видалити</button></td>
                        `;
                        usersTableBody.appendChild(tr);
                    });

                    document.querySelectorAll("select[data-user-id]").forEach(select => {
                        select.addEventListener("change", (event) => {
                            const userId = event.target.getAttribute("data-user-id");
                            const newLevel = event.target.value;
                            fetch(`/admin/update-user-level/${userId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                body: JSON.stringify({ level: newLevel })
                            });
                        });
                    });
                });

                // Отримуємо список пісень
                fetch("/admin/songs", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(songsData => {
                    songsTableBody.innerHTML = ""; 
                    songsData.forEach(song => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${song.song_id}</td>
                            <td>${song.song_name}</td>
                            <td>${song.author}</td>
                            <td>${song.country}</td>
                            <td><button onclick="deleteSong(${song.song_id})">Видалити</button></td>
                        `;
                        songsTableBody.appendChild(tr);
                    });
                });
            }
        } else {
            logout();
        }
    });

});

// Видалення пісні
function deleteSong(songId) {
    fetch(`/admin/delete-song/${songId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
}
