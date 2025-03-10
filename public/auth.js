document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (token) {
        // Користувач залогований
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        logoutBtn.style.display = "block";

        // Отримати ім'я користувача
        fetch("/user", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.username) {
                welcomeMessage.textContent = `Вітаємо, ${data.username}!`;
            } else {
                logout(); // Якщо токен недійсний
            }
        })
        .catch(() => logout());
    } else {
        // Користувач не залогований
        loginBtn.style.display = "inline-block";
        registerBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
});

function logout() {
    localStorage.removeItem("token");
    alert("❌ Ви вийшли з акаунту!");
    window.location.href = "index.html";
}
