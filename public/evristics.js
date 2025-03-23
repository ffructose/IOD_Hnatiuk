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
                <td><button class="apply-heuristic" data-id="${evristic.evristic_id}">Застосувати</button></td>
                <td><button class="cancel-heuristic" data-id="${evristic.evristic_id}">Відмінити</button></td>
            `;

            evristicTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Помилка завантаження популярності евристик:", error);
    }
});










document.addEventListener("DOMContentLoaded", function () {
    const evrSongTable = document.querySelector("#evrSongTable tbody");
    const heuristicColumn = document.getElementById("heuristicColumn");
    let originalData = []; // Початкові дані пісень
    let filteredData = []; // Відфільтровані дані після евристик
    let appliedHeuristics = {}; // Об'єкти пісень, видалені кожною евристикою

    // Завантаження початкових даних
    async function loadSongsData() {
        try {
            const response = await fetch("/evristics/popular-songs");
            const songs = await response.json();
            originalData = songs.map(song => ({ ...song })); // Копія початкових даних
            filteredData = [...originalData]; // На початку вони однакові
            updateTable(filteredData);
        } catch (error) {
            console.error("Помилка завантаження пісень:", error);
        }
    }

    // Оновлення таблиці після фільтрації
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
            <td class="place-cell" data-place="1">${song.first_place_count || 0}</td>
            <td class="place-cell" data-place="2">${song.second_place_count || 0}</td>
            <td class="place-cell" data-place="3">${song.third_place_count || 0}</td>
            <td class="heuristic-result" style="display: none;"></td>
        `;
        evrSongTable.appendChild(row);
    }

    // 🔹 Функція застосування евристики
    function applyHeuristic(heuristicId) {
        console.log(`🔹 Виконання applyHeuristic для евристики ${heuristicId}`);
        heuristicColumn.style.display = "table-cell"; // Показати стовпець "Застосування евристик"

        appliedHeuristics[heuristicId] = []; // Масив для збереження видалених пісень
        let newFilteredData = [];

        evrSongTable.querySelectorAll("tr").forEach(row => {
            const songId = row.getAttribute("data-id");
            const firstPlace = parseInt(row.children[2].textContent) || 0;
            const secondPlace = parseInt(row.children[3].textContent) || 0;
            const thirdPlace = parseInt(row.children[4].textContent) || 0;
            const heuristicCell = row.children[5];

            let remove = false;
            let highlightColor = ""; // Колір виділення клітинки

            switch (heuristicId) {
                case 1:
                    if (thirdPlace === 1 && firstPlace === 0 && secondPlace === 0) {
                        remove = true;
                        highlightColor = "red";
                        heuristicCell.textContent = "🚫 Видалено через евристику 1";
                    }
                    break;

                case 2:
                    if (secondPlace === 1 && firstPlace === 0 && thirdPlace === 0) {
                        remove = true;
                        highlightColor = "blue";
                        heuristicCell.textContent = "🚫 Видалено через евристику 2";
                    }
                    break;

                case 3:
                    if (firstPlace === 1 && secondPlace === 0 && thirdPlace === 0) {
                        remove = true;
                        highlightColor = "green";
                        heuristicCell.textContent = "🚫 Видалено через евристику 3";
                    }
                    break;

                case 4:
                    if (thirdPlace === 2 && firstPlace === 0 && secondPlace === 0) {
                        remove = true;
                        highlightColor = "purple";
                        heuristicCell.textContent = "🚫 Видалено через евристику 4";
                    }
                    break;

                case 5:
                    if (thirdPlace === 1 && secondPlace === 1 && firstPlace === 0) {
                        remove = true;
                        highlightColor = "orange";
                        heuristicCell.textContent = "🚫 Видалено через евристику 5";
                    }
                    break;

                case 6:
                    if (secondPlace === 2 && firstPlace === 0 && thirdPlace === 0) {
                        remove = true;
                        highlightColor = "brown";
                        heuristicCell.textContent = "🚫 Видалено через евристику 6";
                    }
                    break;

                case 7:
                    if (firstPlace === 1 && secondPlace === 1 && thirdPlace === 0) {
                        remove = true;
                        highlightColor = "pink";
                        heuristicCell.textContent = "🚫 Видалено через евристику 7";
                    }
                    break;
            }

            if (!remove) {
                newFilteredData.push({
                    song_id: songId,
                    song_name: row.children[1].textContent,
                    first_place_count: firstPlace,
                    second_place_count: secondPlace,
                    third_place_count: thirdPlace
                });
            } else {
                appliedHeuristics[heuristicId].push({
                    song_id: songId,
                    song_name: row.children[1].textContent,
                    first_place_count: firstPlace,
                    second_place_count: secondPlace,
                    third_place_count: thirdPlace
                });

                // 🔹 Забарвлення відповідної клітинки
                if (highlightColor) {
                    if (thirdPlace > 0) row.children[4].style.backgroundColor = highlightColor;
                    if (secondPlace > 0) row.children[3].style.backgroundColor = highlightColor;
                    if (firstPlace > 0) row.children[2].style.backgroundColor = highlightColor;
                }

                row.style.display = "hidden"; // Приховуємо рядок
            }
        });

        console.log("Нові відфільтровані дані:", newFilteredData);
        filteredData = newFilteredData;
    }


    // 🔹 Функція скасування конкретної евристики
    function cancelHeuristic(heuristicId) {
        console.log(`🔹 Виконання cancelHeuristic для евристики ${heuristicId}`);

        if (!appliedHeuristics[heuristicId] || appliedHeuristics[heuristicId].length === 0) return;

        // Повертаємо тільки ті об'єкти, які були видалені конкретною евристикою
        filteredData = [...filteredData, ...appliedHeuristics[heuristicId]];
        delete appliedHeuristics[heuristicId];

        // 🔹 Очищення кольорів клітинок
        evrSongTable.querySelectorAll("tr").forEach(row => {
            row.children[2].style.backgroundColor = "";
            row.children[3].style.backgroundColor = "";
            row.children[4].style.backgroundColor = "";
        });

        updateTable(filteredData);
    }


    // Додаємо події для кнопок застосування/скасування евристик
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("apply-heuristic")) {
            const heuristicId = parseInt(event.target.getAttribute("data-id"));
            console.log(`🔹 Натиснута кнопка "Застосувати" для евристики ${heuristicId}`);
            applyHeuristic(heuristicId);
        }
        if (event.target.classList.contains("cancel-heuristic")) {
            const heuristicId = parseInt(event.target.getAttribute("data-id"));
            console.log(`🔹 Натиснута кнопка "Відмінити" для евристики ${heuristicId}`);
            cancelHeuristic(heuristicId);
        }
    });


    loadSongsData();
});
