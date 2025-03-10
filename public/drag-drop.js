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

        zone.addEventListener("drop", (event) => {
            event.preventDefault();
            const songId = event.dataTransfer.getData("text/plain");
            const draggedSong = document.querySelector(`.song[data-id='${songId}']`);

            if (zone.children.length === 0) { // Переконуємося, що місце не зайняте
                zone.appendChild(draggedSong);
            }
        });
    });

    songsContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    songsContainer.addEventListener("drop", (event) => {
        event.preventDefault();
        const songId = event.dataTransfer.getData("text/plain");
        const draggedSong = document.querySelector(`.song[data-id='${songId}']`);

        if (draggedSong) {
            const songsArray = Array.from(songsContainer.children).map(song => ({
                id: parseInt(song.getAttribute("data-id")),
                element: song
            }));

            // Додаємо повернену пісню в список
            songsArray.push({
                id: parseInt(draggedSong.getAttribute("data-id")),
                element: draggedSong
            });

            // Сортуємо за ID
            songsArray.sort((a, b) => a.id - b.id);

            // Очищаємо контейнер і додаємо пісні у правильному порядку
            songsContainer.innerHTML = "";
            songsArray.forEach(songObj => songsContainer.appendChild(songObj.element));
        }
    });
}

// Викликаємо функцію після завантаження DOM
document.addEventListener("DOMContentLoaded", initDragAndDrop);
