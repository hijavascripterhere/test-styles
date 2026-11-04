var navclicker = document.getElementById("navclicker")
var navupgrade = document.getElementById("navupgrades")
var navtutorial = document.getElementById("navtutorial")

var clickertab = document.getElementById("button")
var upgradetab = document.getElementById("UPGRADES")
var tutorialtab = document.getElementById("tutorialtab")

navclicker.onclick = function () {
    clickertab.style.display = "flex";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "none";
}

navupgrade.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "flex";
    tutorialtab.style.display = "none";
}

navtutorial.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "flex";
}