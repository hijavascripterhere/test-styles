document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

localStorage.clear()

let stats = JSON.parse(
    localStorage.getItem("stats")
) || {
    coins: 0,
    coinsperclick: 0.1,
    tokens: 0,
    cpstok: 0,
    tokensperclick: 0,
    cpstokmax: 20,
    UTcost: 15,
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
    },
    cpsup3: {
        cost: 10,
        available: true,
    },
    cpsup4: {
        cost: 20,
        available: true,
    }
}

upgrades.cpsup1.element = document.getElementById("cpsup1");
upgrades.cpsup2.element = document.getElementById("cpsup2");
upgrades.cpsup3.element = document.getElementById("cpsup3");
upgrades.cpsup4.element = document.getElementById("cpsup4");

const button = document.getElementById("button")
var coins = document.getElementById("coins")
var currentcoins = document.getElementById("currentcoins")
var coinsperclick = document.getElementById("coinsperclick")
var tokens = document.getElementById("tokens")
var cpstok = document.getElementById("cpstok")
var tokenperclick = document.getElementById("tokenperclick")
var ptokens = document.getElementById("ptokens")
var cpsatok = document.getElementById("cpsatok")

function abbreviate(num) {
    if (num >= 1e15) return (num / 1e15).toFixed(1) + "Q";
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

    return num;
}

function roundn(num) {
    return Math.round(num * 100) / 100;
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
    coins.innerText = `${abbreviate(roundn(stats.coins))}$`;
    currentcoins.innerHTML = `coins: ${abbreviate(roundn(stats.coins))}$`
    coinsperclick.innerHTML = `coins per click: ${abbreviate(roundn(stats.coinsperclick))}`
    tokens.innerHTML = `UT: ${abbreviate(roundn(stats.tokens))}`
    cpstok.innerHTML = `Clicker: ${abbreviate(roundn(stats.cpstok))}`
    tokenperclick.innerHTML = `UT per click: ${abbreviate(roundn(stats.tokensperclick))}`
    ptokens.innerHTML = `UT cost: ${abbreviate(roundn(stats.UTcost))}$`
    savegame()
}


function priceinc(num) {
    num = num * 1.1
    return num
}

/* update text on start of website */
updatetext()

button.onclick = function () {
    stats.coins += stats.coinsperclick
    stats.tokens += stats.tokensperclick
    updatetext();
}


/* ugrade functions */

ptokens.onclick = function () {
    if (stats.coins >= stats.UTcost) {
        stats.coins -= stats.UTcost
        stats.tokens += 1
        priceinc(stats.UTcost)

        stats.UTcost = priceinc(stats.UTcost)
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
        stats.coinsperclick += 0.3
        upgrades["cpsup1"].available = false
        updatetext()
    }
}

cpsup2.onclick = function () {
    if (stats.cpstok >= 4 && upgrades["cpsup2"].available) {
        stats.coinsperclick *= 1.5
        upgrades["cpsup2"].available = false
        updatetext()
    }
}

cpsup3.onclick = function () {
    if (stats.cpstok >= 10 && upgrades["cpsup3"].available) {
        stats.tokensperclick += 0.02
        upgrades["cpsup3"].available = false
        updatetext()
    }
}

cpsup4.onclick = function () {
    if (stats.cpstok >= 1 && upgrades["cpsup4"].available) {
        stats.coinsperclick += 0.5
        upgrades["cpsup4"].available = false
        updatetext()
    }
}