const tooltip = document.getElementById("tooltip");

document.querySelectorAll("[data-tooltip]").forEach(element => {

    element.addEventListener("mouseenter", () => {
        tooltip.innerText = element.dataset.tooltip;
        tooltip.style.display = "block";
    });

    element.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.clientX + 15 + "px";
        tooltip.style.top = e.clientY + -10 + "px";
    });

    element.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });

});