document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

let stats = JSON.parse(
    localStorage.getItem("stats")
) || {
    coins: 0,
    coinsperclick: 0.1,
    tokens: 0,
    cpstok: 0,
};

let upgrades = JSON.parse(
    localStorage.getItem("upgrades")
) || {
    cpsup1: {
        cost: 1,
        available: true,
    },
    cpsup2: {
        cost: 4,
        available: true,
    }
}

upgrades.cpsup1.element = document.getElementById("cpsup1");
upgrades.cpsup2.element = document.getElementById("cpsup2");

const button = document.getElementById("button")
var coins = document.getElementById("coins")
var currentcoins = document.getElementById("currentcoins")
var coinsperclick = document.getElementById("coinsperclick")
var tokens = document.getElementById("tokens")
var cpstok = document.getElementById("cpstok")

function abbreviate(num) {
    if (num >= 1e15) return (num / 1e15).toFixed(1) + "Q";
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

    return num;
}

function savegame() {
    localStorage.setItem("stats", JSON.stringify(stats));
    localStorage.setItem("upgrades", JSON.stringify(upgrades));
}


/* update text function */
function updatetext() {
    for (let upgrade in upgrades) {
        if (upgrades[upgrade].available) {
            upgrades[upgrade].element.style.color = "white";
        } else {
            upgrades[upgrade].element.style.color = "gray";
        }
    }

    let number = stats.coins
    let number1 = stats.coinsperclick
    number1 = Math.round(number1 * 100) / 100
    number = Math.round(number * 100) / 100
    coins.innerText = abbreviate(number);
    currentcoins.innerHTML = `coins: ${abbreviate(number)}`
    coinsperclick.innerHTML = `coins per click: ${abbreviate(number1)}`
    tokens.innerHTML = `UT: ${abbreviate(stats.tokens)}`
    cpstok.innerHTML = `Clicker: ${abbreviate(stats.cpstok)}`
    savegame()
}


/* update text on start of website */
updatetext()

button.onclick = function () {
    stats.coins += stats.coinsperclick;
    updatetext();
}


/* ugrade functions */
const ptokens = document.getElementById("ptokens")
const cpsatok = document.getElementById("cpsatok")

ptokens.onclick = function () {
    if (stats.coins >= 15) {
        stats.coins -= 15
        stats.tokens += 1
        updatetext()
    }
}

cpsatok.onclick = function () {
    if (stats.tokens >= 1) {
        stats.tokens -= 1
        stats.cpstok += 1
        updatetext()
    }
}

cpsup1.onclick = function () {
    if (stats.cpstok >= 1 && upgrades["cpsup1"].available) {
        stats.coinsperclick += 0.2
        upgrades["cpsup1"].available = false
        updatetext()
    }
}

cpsup2.onclick = function () {
    if (stats.cpstok >= 4 && upgrades["cpsup2"].available) {
        stats.coinsperclick *= 1.3
        upgrades["cpsup2"].available = false
        updatetext()
    }
}

