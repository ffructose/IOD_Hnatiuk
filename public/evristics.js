document.addEventListener("DOMContentLoaded", async function () {
    const evrTable = document.getElementById("sortableBestEvr");
    const userId = localStorage.getItem("user_id"); // Отримуємо ID користувача

    if (!userId) {
        alert("❌ Ви не авторизовані!");
        window.location.href = "login.html";
        return;
    }

    try {
        // 1️⃣ Отримуємо евристики для користувача
        const response = await fetch(`/evristics/user/${userId}`);
        let evristics = await response.json();

        if (!Array.isArray(evristics)) {
            throw new Error("Сервер повернув неправильний формат даних.");
        }

        evristics.sort((a, b) => a.place - b.place); // Сортуємо за місцем
        evrTable.innerHTML = ""; // Очищаємо таблицю

        // Додаємо евристики в таблицю
        evristics.forEach(evristic => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", evristic.evristic_id);
            row.setAttribute("draggable", "true"); // Дозволяємо перетягування
            row.innerHTML = `
                <td>${evristic.evristic_id}</td>
                <td>${evristic.description}</td>
            `;
            evrTable.appendChild(row);

            // Додаємо події для перетягування
            row.addEventListener("dragstart", handleDragStart);
            row.addEventListener("dragover", handleDragOver);
            row.addEventListener("drop", handleDrop);
            row.addEventListener("dragend", handleDragEnd);
        });

        updateRowStyles(); // Оновлюємо стилі (золотий, срібний, бронзовий)

    } catch (error) {
        console.error("Помилка завантаження евристик:", error);
    }
});

// Змінна для збереження поточного елемента, що перетягується
let draggedRow = null;

/**
 * Обробник початку перетягування
 */
function handleDragStart(event) {
    draggedRow = event.target; // Запам'ятовуємо рядок
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", event.target.innerHTML);
    event.target.style.opacity = "0.5";
}

/**
 * Дозволяє перетягування через інші рядки
 */
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

/**
 * Обробник події `drop` — змінює порядок евристик
 */
function handleDrop(event) {
    event.preventDefault();
    if (draggedRow && event.target.closest("tr")) {
        const targetRow = event.target.closest("tr");

        if (draggedRow !== targetRow) {
            let parent = targetRow.parentNode;
            let rows = Array.from(parent.children);
            let draggedIndex = rows.indexOf(draggedRow);
            let targetIndex = rows.indexOf(targetRow);

            if (draggedIndex > targetIndex) {
                parent.insertBefore(draggedRow, targetRow);
            } else {
                parent.insertBefore(draggedRow, targetRow.nextSibling);
            }

            updateRowStyles(); // Оновлюємо кольори
            saveEvristicOrder(localStorage.getItem("user_id")); // Зберігаємо в БД
        }
    }
}

/**
 * Очищує стилі після завершення перетягування
 */
function handleDragEnd(event) {
    event.target.style.opacity = "1";
}

/**
 * Оновлює стилі топ-3 евристик
 */
function updateRowStyles() {
    let rows = document.querySelectorAll("#sortableBestEvr tr");
    rows.forEach(row => row.style.backgroundColor = ""); // Очищаємо фон

    if (rows[0]) rows[0].style.backgroundColor = "gold";
    if (rows[1]) rows[1].style.backgroundColor = "silver";
    if (rows[2]) rows[2].style.backgroundColor = "#cd7f32";
}

/**
 * Зберігає новий порядок евристик у базі
 */
async function saveEvristicOrder(userId) {
    let rows = document.querySelectorAll("#sortableBestEvr tr");
    let places = [];

    rows.forEach((row, index) => {
        places.push({
            evristic_id: row.getAttribute("data-id"),
            place: index + 1 // Новий порядок
        });
    });

    try {
        const res = await fetch("/evristics/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, places })
        });

        if (!res.ok) {
            throw new Error("❌ Помилка оновлення евристик.");
        }

        console.log("✅ Евристики оновлені");

        // 🔹 Логування дії користувача
        await fetch("/log-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, action: "Оновлення порядку евристик" })
        });

    } catch (error) {
        console.error("Помилка збереження порядку евристик:", error);
    }
}
