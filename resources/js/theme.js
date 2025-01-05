document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.getElementById("theme-toggle");
    const themeIcon = document.createElement("i");
    themeIcon.id = "theme-icon";
    themeIcon.classList.add("fas");
    themeToggleButton.appendChild(themeIcon);

    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark-mode") {
        document.body.classList.add("dark-mode");
        themeIcon.classList.add("fa-sun");
    } else {
        themeIcon.classList.add("fa-moon");
    }

    themeToggleButton.addEventListener("click", () => {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "default");
            themeIcon.classList.remove("fa-sun");
            themeIcon.classList.add("fa-moon");
        } else {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark-mode");
            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");
        }
    });
});
