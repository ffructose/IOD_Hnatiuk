document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.createElement("div");
    document.body.prepend(headerContainer);

    try {
        const response = await fetch("header.html");
        const html = await response.text();
        headerContainer.innerHTML = html;

        // Перевіряємо наявність токена (тобто, чи користувач залогувався)
        const token = localStorage.getItem("token");
        const loginBtn = document.getElementById("loginBtn");
        const registerBtn = document.getElementById("registerBtn");
        const logoutBtn = document.getElementById("logoutBtn");

        if (token) {
            // Якщо користувач залогувався, приховуємо кнопки "Увійти" і "Реєстрація"
            loginBtn.style.display = "none";
            registerBtn.style.display = "none";
            logoutBtn.style.display = "inline-block"; // Показуємо "Вийти"
            accBtn.style.display = "inline-block"; // Показуємо "кабінет"
        } else {
            // Якщо користувач не залогований, показуємо кнопки "Увійти" і "Реєстрація"
            loginBtn.style.display = "inline-block";
            registerBtn.style.display = "inline-block";
            logoutBtn.style.display = "none"; // Приховуємо "Вийти"
            accBtn.style.display = "none"; // Приховуємо "кабінет"

        }

        // Функція виходу з акаунта
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token"); // Видаляємо токен
            localStorage.removeItem("user_id"); // Видаляємо user_id
            alert("✅ Ви вийшли з акаунта!");
            window.location.href = "login.html"; // Перенаправляємо на сторінку входу
        });

    } catch (error) {
        console.error("❌ Помилка завантаження хедера:", error);
    }
});
