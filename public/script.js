document.addEventListener("DOMContentLoaded", () => {
    // Логін
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            document.getElementById("loginMessage").textContent = data.message || "Помилка входу";
        });
    }

    // Реєстрація
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("registerUsername").value;
            const password = document.getElementById("registerPassword").value;

            const res = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            document.getElementById("registerMessage").textContent = data.message || "Помилка реєстрації";
        });
    }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Запобігаємо перезавантаженню сторінки

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token); // Зберігаємо JWT-токен
        alert("✅ Вхід успішний! Перенаправлення на головну...");
        window.location.href = "/"; // Редирект на головну сторінку
    } else {
        alert("❌ " + data.message);
    }
});

