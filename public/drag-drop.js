function initDragAndDrop() {
    const songs = document.querySelectorAll(".song");
    const dropZones = document.querySelectorAll(".drop-zone");
    const songsContainer = document.getElementById("songsContainer");

    songs.forEach(song => {
        song.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", event.target.getAttribute("data-id"));
            event.target.classList.add("dragging");
        });

        song.addEventListener("dragend", (event) => {
            event.target.classList.remove("dragging");
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        zone.addEventListener("drop", async (event) => {
            event.preventDefault();
            const songId = event.dataTransfer.getData("text/plain");
            const draggedSong = document.querySelector(`.song[data-id='${songId}']`);

            if (!draggedSong) return;

            if (zone.children.length === 0) { // Не давати можливості ставити кілька пісень на одне місце
                zone.appendChild(draggedSong);

                const userId = localStorage.getItem("user_id");
                if (userId) {
                    await logUserAction(userId, `Користувач поставив пісню ID ${songId} на місце ${zone.dataset.rank}`);
                }
            }
        });
    });

    songsContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    songsContainer.addEventListener("drop", async (event) => {
        event.preventDefault();
        const songId = event.dataTransfer.getData("text/plain");
        const draggedSong = document.querySelector(`.song[data-id='${songId}']`);

        if (!draggedSong) return;

        songsContainer.appendChild(draggedSong);

        const userId = localStorage.getItem("user_id");
        if (userId) {
            await logUserAction(userId, `Користувач повернув пісню ID ${songId} назад у список`);
        }

        // Сортування після повернення
        const songsArray = Array.from(songsContainer.children).map(song => ({
            id: parseInt(song.getAttribute("data-id")),
            element: song
        }));

        songsArray.sort((a, b) => a.id - b.id);

        songsContainer.innerHTML = "";
        songsArray.forEach(songObj => songsContainer.appendChild(songObj.element));
    });
}

// Логування дій користувача в базу
async function logUserAction(userId, actionText) {
    await fetch("/main/log-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: actionText })
    });
}

// Викликаємо функцію після завантаження DOM
document.addEventListener("DOMContentLoaded", initDragAndDrop);
