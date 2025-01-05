document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle button
    const themeToggleButton = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark-mode") {
        document.body.classList.add("dark-mode");
    }
    themeToggleButton.addEventListener("click", changeStyle);
});

function changeStyle() {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "default");
    } else {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark-mode");
    }
}
