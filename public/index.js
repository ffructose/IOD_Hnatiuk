document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("saveButton").addEventListener("click", async function () {
        const userId = localStorage.getItem("user_id"); // Отримуємо ID користувача
        if (!userId) {
            alert("Необхідно увійти в систему!");
            return;
        }

        const places = [];
        document.querySelectorAll(".drop-zone").forEach(zone => {
            if (zone.children.length > 0) {
                const songId = zone.children[0].getAttribute("data-id");
                const place = zone.getAttribute("data-rank");
                places.push({ song_id: songId, place });
            }
        });

        if (places.length !== 3) {
            alert("Потрібно вибрати всі три місця!");
            return;
        }

        const response = await fetch("/main/save-places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, places })
        });

        const data = await response.json();
        if (data.message) {
            alert("Успішно збережено!");
        } else {
            alert("Помилка збереження.");
        }
    });
});
