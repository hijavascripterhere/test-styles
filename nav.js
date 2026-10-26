var navclicker = document.getElementById("navclicker")
var navupgrade = document.getElementById("navupgrades")

var clickertab = document.getElementById("button")
var upgradetab = document.getElementById("UPGRADES")

navclicker.onclick = function () {
    clickertab.style.display = "flex";
    upgradetab.style.display = "none";
}

navupgrade.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "flex";
}