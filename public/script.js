document.addEventListener("DOMContentLoaded", () => {
    // Логін
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const res = await fetch("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("token", data.token); // Зберігаємо токен
                    localStorage.setItem("user_id", data.user_id); // Зберігаємо user_id

                    alert("✅ Вхід успішний! Перенаправлення...");
                    window.location.href = "/account.html";
                } else {
                    document.getElementById("loginMessage").textContent = "❌ " + data.message;
                }
            } catch (error) {
                console.error("Помилка запиту:", error);
                document.getElementById("loginMessage").textContent = "❌ Помилка сервера";
            }
        });
    }

    // Реєстрація
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("registerUsername").value;
            const password = document.getElementById("registerPassword").value;
            const full_name = document.getElementById("registerFullName").value;

            try {
                const res = await fetch("/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, full_name })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Реєстрація успішна! Тепер увійдіть.");
                    window.location.href = "login.html";
                } else {
                    document.getElementById("registerMessage").textContent = "❌ " + data.message;
                }
            } catch (error) {
                console.error("Помилка реєстрації:", error);
                document.getElementById("registerMessage").textContent = "❌ Помилка сервера";
            }
        });
    }
});
