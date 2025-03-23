document.addEventListener("DOMContentLoaded", function () {
    let evrTable = document.getElementById("sortableBestEvr");

    // Ініціалізація бібліотеки Sortable.js
    new Sortable(evrTable, {
        animation: 150, // Гладка анімація перетягування
        ghostClass: "dragging", // Додає клас під час перетягування
        onEnd: function () {
            updateRowStyles();
        }
    });

    function updateRowStyles() {
        let rows = evrTable.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++) {
            rows[i].style.backgroundColor = ""; // Скидаємо фон для всіх
        }
        if (rows[0]) rows[0].style.backgroundColor = "gold";
        if (rows[1]) rows[1].style.backgroundColor = "silver";
        if (rows[2]) rows[2].style.backgroundColor = "#cd7f32";
    }
});
