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

document.addEventListener("DOMContentLoaded", async function () {
    const bestSongsTableBody = document.querySelector("#bestSongsTable tbody");

    try {
        const response = await fetch("/evristics/popular-songs");
        let songs = await response.json();

        if (!Array.isArray(songs)) {
            throw new Error("Сервер повернув неправильний формат даних.");
        }

        bestSongsTableBody.innerHTML = ""; // Очищаємо таблицю перед оновленням

        songs.forEach(song => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${song.song_id}</td>
                <td>${song.song_name} (${song.author})</td>
                <td>${song.first_place_count}</td>
                <td>${song.second_place_count}</td>
                <td>${song.third_place_count}</td>
            `;
            bestSongsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Помилка завантаження популярних пісень:", error);
        bestSongsTableBody.innerHTML = "<tr><td colspan='5'>Не вдалося завантажити пісні.</td></tr>";
    }
});
document.addEventListener("DOMContentLoaded", async function () {
    const evristicTableBody = document.querySelector("#evristicTable tbody");

    try {
        const response = await fetch("/evristics/popular");
        let evristics = await response.json();

        if (!Array.isArray(evristics)) {
            throw new Error("Сервер повернув неправильний формат даних.");
        }

        evristicTableBody.innerHTML = ""; // Очищаємо таблицю перед оновленням

        evristics.forEach(evristic => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${evristic.evristic_id}</td>
                <td>${evristic.description}</td>
                <td>${evristic.place_1 || 0}</td>
                <td>${evristic.place_2 || 0}</td>
                <td>${evristic.place_3 || 0}</td>
                <td>${evristic.place_4 || 0}</td>
                <td>${evristic.place_5 || 0}</td>
                <td>${evristic.place_6 || 0}</td>
                <td>${evristic.place_7 || 0}</td>
                <td><button class="apply-btn" data-id="${evristic.evristic_id}">Застосувати</button></td>
                <td><button class="cancel-btn" data-id="${evristic.evristic_id}">Відмінити</button></td>
            `;

            evristicTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Помилка завантаження популярності евристик:", error);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const evrSongTable = document.getElementById("evrSongTable").querySelector("tbody");
    const heuristicColumn = document.getElementById("heuristicColumn");
    let originalData = []; // Початкові дані пісень
    let appliedHeuristics = {}; // Активні евристики

    // Завантаження початкових даних
    async function loadSongsData() {
        try {
            const response = await fetch("/evristics/popular");
            const songs = await response.json();
            originalData = songs.map(song => ({ ...song })); // Копія початкових даних
            updateTable(originalData);
        } catch (error) {
            console.error("Помилка завантаження пісень:", error);
        }
    }

    // Оновлення таблиці з об'єктами пісень
    function updateTable(songs) {
        evrSongTable.innerHTML = "";
        songs.forEach(song => addSongRow(song));
    }

    // Додавання рядків у таблицю
    function addSongRow(song) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", song.song_id);

        row.innerHTML = `
            <td>${song.song_id}</td>
            <td>${song.song_name}</td>
            <td class="place-cell" data-place="1">${song.first_place}</td>
            <td class="place-cell" data-place="2">${song.second_place}</td>
            <td class="place-cell" data-place="3">${song.third_place}</td>
            <td class="heuristic-result" style="display: none;"></td>
        `;
        evrSongTable.appendChild(row);
    }

    // 🔹 Функція застосування евристики
    function applyHeuristic(heuristicId) {
        heuristicColumn.style.display = "table-cell"; // Показати стовпець "Застосування евристик"
        appliedHeuristics[heuristicId] = true; // Додаємо евристику у список застосованих

        const rows = evrSongTable.querySelectorAll("tr");
        let filteredSongs = [];

        rows.forEach(row => {
            const songId = row.getAttribute("data-id");
            const firstPlace = parseInt(row.children[2].textContent) || 0;
            const secondPlace = parseInt(row.children[3].textContent) || 0;
            const thirdPlace = parseInt(row.children[4].textContent) || 0;
            const heuristicCell = row.children[5];

            let remove = false;

            switch (heuristicId) {
                case 1: // Видаляємо об'єкти, які тільки на 3 місці
                    if (thirdPlace > 0 && firstPlace === 0 && secondPlace === 0) {
                        remove = true;
                        row.children[4].style.backgroundColor = "red"; // 🔴 Виділення червоним
                    }
                    break;

                case 2:
                    // Логіка евристики 2 (заповніть самостійно)
                    break;

                case 3:
                    // Логіка евристики 3 (заповніть самостійно)
                    break;
            }

            if (!remove) {
                filteredSongs.push({
                    song_id: songId,
                    song_name: row.children[1].textContent
                });
                heuristicCell.textContent = "✅ Пройшло евристику";
            } else {
                row.style.display = "none"; // Видаляємо рядок
            }
        });

        updateFinalTable(filteredSongs);
    }

    // 🔹 Функція оновлення фінальної таблиці (що пройшло евристику)
    function updateFinalTable(filteredSongs) {
        let finalTable = document.getElementById("evrSongTable").querySelector("tbody");
        finalTable.innerHTML = "";

        filteredSongs.forEach(song => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${song.song_id}</td>
                <td>${song.song_name}</td>
                <td>✅ Пройшло евристику</td>
            `;
            finalTable.appendChild(row);
        });
    }

    // 🔹 Функція скасування конкретної евристики
    function cancelHeuristic(heuristicId) {
        if (!appliedHeuristics[heuristicId]) return; // Якщо евристика не була застосована, не робимо нічого

        delete appliedHeuristics[heuristicId]; // Видаляємо евристику зі списку застосованих

        // Якщо після скасування немає жодної активної евристики – ховаємо стовпець
        if (Object.keys(appliedHeuristics).length === 0) {
            heuristicColumn.style.display = "none";
        }

        // Відновлюємо оригінальні дані
        updateTable(originalData);

        // Видаляємо червоний колір клітинок, якщо була евристика 1
        const rows = evrSongTable.querySelectorAll("tr");
        rows.forEach(row => {
            row.children[4].style.backgroundColor = ""; // Прибираємо виділення червоним
        });
    }

    // 🔹 Додаємо події для кнопок застосування/скасування евристик
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("apply-heuristic")) {
            const heuristicId = parseInt(event.target.getAttribute("data-id"));
            applyHeuristic(heuristicId);
        }
        if (event.target.classList.contains("cancel-heuristic")) {
            const heuristicId = parseInt(event.target.getAttribute("data-id"));
            cancelHeuristic(heuristicId);
        }
    });

    loadSongsData();
});


