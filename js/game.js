import {
    auth,
    register,
    login,
    logout,
    onAuthStateChanged
} from "./firebase.js";

let currentUser = null;

const authContainer = document.getElementById("auth-container");
const accountContainer = document.getElementById("account-container");

const authMessage = document.getElementById("auth-message");
const accountEmail = document.getElementById("account-email");

document.getElementById("register-button").onclick = async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        await register(email, password);
        authMessage.textContent = "Account created!";
    } catch (error) {
        authMessage.textContent = error.message;
        console.error(error);
    }
};

document.getElementById("login-button").onclick = async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        await login(email, password);
        authMessage.textContent = "Logged in!";
    } catch (error) {
        authMessage.textContent = error.message;
        console.error(error);
    }
};

document.getElementById("logout-button").onclick = async () => {
    try {
        await logout();
    } catch (error) {
        console.error(error);
    }
};

onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
        authContainer.hidden = true;
        accountContainer.hidden = false;

        accountEmail.textContent = user.email;

        console.log("Logged in:", user.uid);
    } else {
        authContainer.hidden = false;
        accountContainer.hidden = true;

        console.log("Not logged in");
    }
});

document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

let stats = JSON.parse(
    localStorage.getItem("stats")
) || {
    coins: 0,
    coinsperclick: 0.5,
    tokens: 0,
    cpstok: 0,
    tokensperclick: 0,
    cpstokmax: 20,
    UTcost: 15,
    autoclickerunl: false,
    acps: 1,
    cbstok: 0,
    autotokensperclick: 0,
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
    },
    cbsup1: {
        cost: 10,
        available: true,
    },
    cbsup2: {
        cost: 30,
        available: true,
    }
}

/* clicker upgrades */
upgrades.cpsup1.element = document.getElementById("cpsup1");
upgrades.cpsup2.element = document.getElementById("cpsup2");
upgrades.cpsup3.element = document.getElementById("cpsup3");
upgrades.cpsup4.element = document.getElementById("cpsup4");

/* autoclicker upgrades */
upgrades.cbsup1.element = document.getElementById("cbsup1");
upgrades.cbsup2.element = document.getElementById("cbsup2");

var versiontext = document.getElementById("versiontext")

const CURRENT_VERSION = "1.0.8b";
const gameVersion = localStorage.getItem("gameVersion");

versiontext.innerHTML = `newest version: ${CURRENT_VERSION}<br> your current version: ${gameVersion}`

if (gameVersion !== CURRENT_VERSION) {
    localStorage.removeItem("stats");
    localStorage.removeItem("upgrades");

    localStorage.setItem("gameVersion", CURRENT_VERSION);
    updatetext()
}

const button = document.getElementById("button")
var coins = document.getElementById("coins")
var currentcoins = document.getElementById("currentcoins")
var coinsperclick = document.getElementById("coinsperclick")
var tokens = document.getElementById("tokens")
var tokenperclick = document.getElementById("tokenperclick")
var ptokens = document.getElementById("ptokens")
var cps = document.getElementById("cps")

var cpstok = document.getElementById("cpstok")
var cpsatok = document.getElementById("cpsatok")

var cbsatok = document.getElementById("cbsatok")
var cbstok = document.getElementById("cbstok")

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
        } else if (!upgrades[upgrade].available) {
            upgrades[upgrade].element.style.color = "gray";
        }
    }
    coins.innerText = `${abbreviate(roundn(stats.coins))}$`;
    currentcoins.innerHTML = `coins: ${abbreviate(roundn(stats.coins))}$`
    coinsperclick.innerHTML = `coins per click: ${abbreviate(roundn(stats.coinsperclick))}`
    tokens.innerHTML = `UT: ${abbreviate(roundn(stats.tokens))}`
    cpstok.innerHTML = `Clicker - ${abbreviate(roundn(stats.cpstok))}`
    tokenperclick.innerHTML = `UT per click: ${abbreviate(roundn(stats.tokensperclick))}`
    ptokens.innerHTML = `UT cost: ${abbreviate(roundn(stats.UTcost))}$`
    cbstok.innerHTML = `autoclicker - ${abbreviate(roundn(stats.cbstok))}`
    savegame()
}


function priceinc(num) {
    num = num * 1.1
    return num
}

function click() {
    stats.coins += stats.coinsperclick
    stats.tokens += stats.tokensperclick
}

function aclick() {
    stats.coins += stats.acps  * ((stats.cbstok/100)+1)
    stats.tokens += stats.autotokensperclick
}

/* update text on start of website */
updatetext()

button.onclick = function () {
    click()
    updatetext();
}

var cc = stats.coins

setInterval(function () {
    var newcc = stats.coins
    var upcc = newcc - cc

    cps.innerHTML = `coins per second: ${roundn(upcc)}$`

    cc = newcc
}, 1000)

setInterval(function () {
    if (stats.autoclickerunl) {
        aclick()
        updatetext()
    }
}, 500)

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

cbsatok.onclick = function () {
    if (stats.tokens >= 1) {
        stats.tokens -= 1
        stats.cbstok += 1
        updatetext()
    }
}

cpsup1.onclick = function () {
    if (stats.cpstok >= upgrades["cpsup1"].cost && upgrades["cpsup1"].available) {
        stats.coinsperclick += 0.3
        upgrades["cpsup1"].available = false
        updatetext()
    }
}

cpsup2.onclick = function () {
    if (stats.cpstok >= upgrades["cpsup2"].cost && upgrades["cpsup2"].available) {
        stats.coinsperclick *= 1.5
        upgrades["cpsup2"].available = false
        updatetext()
    }
}

cpsup3.onclick = function () {
    if (stats.cpstok >= upgrades["cpsup3"].cost && upgrades["cpsup3"].available) {
        stats.tokensperclick += 0.02
        upgrades["cpsup3"].available = false
        updatetext()
    }
}

cpsup4.onclick = function () {
    if (stats.cpstok >= upgrades["cpsup4"].cost && upgrades["cpsup4"].available) {
        stats.coinsperclick += 0.5
        upgrades["cpsup4"].available = false
        updatetext()
    }
}

cbsup1.onclick = function () {
    if (stats.cbstok >= upgrades["cbsup1"].cost && upgrades["cbsup1"].available) {
        stats.autoclickerunl = true
        upgrades["cbsup1"].available = false
        updatetext()
    }
}

cbsup2.onclick = function () {
    if (stats.cbstok >= upgrades["cbsup2"].cost && upgrades["cbsup2"].available) {
        stats.autotokensperclick += 0.01
        upgrades["cbsup2"].available = false
        updatetext()
    }
}