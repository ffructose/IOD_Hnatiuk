document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.createElement("div");
    document.body.prepend(headerContainer);

    try {
        const response = await fetch("header.html");
        const html = await response.text();
        headerContainer.innerHTML = html;
    } catch (error) {
        console.error("Помилка завантаження хедера:", error);
    }
});
