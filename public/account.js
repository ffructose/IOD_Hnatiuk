document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userLevelSpan = document.getElementById("userLevel");
    const logoutButton = document.getElementById("logoutButton");

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
        } else {
            logout(); // Якщо токен недійсний
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
