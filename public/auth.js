document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userLevelSpan = document.getElementById("userLevel");

    if (userLevelSpan) {
        if (!token) {
            alert("❌ Ви не авторизовані!");
            window.location.href = "login.html";
        } else {
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
        }
    }
});

function logout() {
    localStorage.removeItem("token");
    alert("❌ Ви вийшли з акаунту!");
    window.location.href = "index.html";
}
