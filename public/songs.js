document.addEventListener("DOMContentLoaded", async function () {
    const songsContainer = document.getElementById("songsContainer");

    try {
        const response = await fetch("/songs");
        let songs = await response.json();

        console.log("Отримані пісні:", songs);

        if (!Array.isArray(songs)) {
            throw new Error("Сервер повернув неправильний формат даних.");
        }

        // Сортуємо пісні за song_id
        songs.sort((a, b) => a.song_id - b.song_id);

        if (songs.length === 0) {
            songsContainer.innerHTML = "<p>Список пісень порожній.</p>";
            return;
        }

        // Додаємо кожну пісню до контейнера
        songs.forEach(song => {
            const songDiv = document.createElement("div");
            songDiv.classList.add("song");
            songDiv.setAttribute("draggable", "true");
            songDiv.setAttribute("data-id", song.song_id);
            songDiv.innerHTML = `
                <small>${song.country}</small>
                <h3>${song.song_name}</h3>
                <small>${song.author}</small>
            `;
            songsContainer.appendChild(songDiv);
        });

        initDragAndDrop(); // Ініціалізація подій перетягування

    } catch (error) {
        console.error("Помилка завантаження пісень:", error);
        songsContainer.innerHTML = "<p>Не вдалося завантажити список пісень.</p>";
    }
});
