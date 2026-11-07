var navclicker = document.getElementById("navclicker")
var navupgrade = document.getElementById("navupgrades")
var navtutorial = document.getElementById("navtutorial")
var navupdatelogtab = document.getElementById("navupdatelog")
var navmisc = document.getElementById("navmisc")
const navleaderboard = document.getElementById("navleaderboard")

var clickertab = document.getElementById("button")
var upgradetab = document.getElementById("UPGRADES")
var tutorialtab = document.getElementById("tutorialtab")
var updatelogtab = document.getElementById("updatelogtab")

const leaderboardtab = document.getElementById("leaderboardtab")

const menu = document.getElementById("menu")

navclicker.onclick = function () {
    clickertab.style.display = "flex";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "none";
    updatelogtab.style.display = "none";
    leaderboardtab.style.display = "none";
}

navupgrade.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "flex";
    tutorialtab.style.display = "none";
    updatelogtab.style.display = "none";
    leaderboardtab.style.display = "none";
}

navtutorial.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "flex";
    updatelogtab.style.display = "none";
    leaderboardtab.style.display = "none";
}

navupdatelogtab.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "none";
    updatelogtab.style.display = "flex";
    leaderboardtab.style.display = "none";
}

navleaderboard.onclick = function () {
    clickertab.style.display = "none";
    upgradetab.style.display = "none";
    tutorialtab.style.display = "none";
    updatelogtab.style.display = "none";
    leaderboardtab.style.display = "flex";
}

var ismenuopen = false

navmisc.onclick = function () {
    if (!ismenuopen) {
        menu.style.display = "flex"
        ismenuopen = true
    } else if (ismenuopen) {
        menu.style.display = "none"
        ismenuopen = false
    }
}

document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !navmisc.contains(event.target)) {
        menu.style.display = "none";
        ismenuopen = false
    }
});