document.addEventListener("DOMContentLoaded", async function () {
    const songsList = document.getElementById("songsList");

    try {
        const response = await fetch("/songs/songs");
        const songs = await response.json();

        if (songs.length === 0) {
            songsList.innerHTML = "<li>Список пісень порожній.</li>";
            return;
        }

        songs.forEach(song => {
            const li = document.createElement("li");
            li.textContent = `${song.song_name} - ${song.author} (${song.country})`;
            songsList.appendChild(li);
        });
    } catch (error) {
        console.error("Помилка завантаження пісень:", error);
        songsList.innerHTML = "<li>Не вдалося завантажити список пісень.</li>";
    }
});
