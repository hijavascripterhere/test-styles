import {
    auth,
    db,
    register,
    login,
    logout,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "./firebase.js";

const authContainer = document.getElementById("auth-container");
const accountContainer = document.getElementById("account-container");

const authMessage = document.getElementById("auth-message");
const accountEmail = document.getElementById("account-email");

document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

let stats = {
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

let upgrades = {
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

const CURRENT_VERSION = "v1.0.0";

versiontext.innerHTML = `current version: ${CURRENT_VERSION}`;

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

let currentUser = null;
let gameReady = false;
let saveDirty = false;

function savegame() {
    saveDirty = true;
}

async function uploadSave() {
    if (!currentUser || !saveDirty || !gameReady) return;

    saveDirty = false;

    // Remove HTML elements from upgrades before saving
    let cleanUpgrades = {};

    for (let upgrade in upgrades) {
        cleanUpgrades[upgrade] = {
            cost: upgrades[upgrade].cost,
            available: upgrades[upgrade].available
        };
    }

    try {
        await setDoc(doc(db, "players", currentUser.uid), {
            stats: stats,
            upgrades: cleanUpgrades,
            lastSaved: serverTimestamp(),
            schemaVersion: 1
        });

        console.log("Game saved to cloud!");
    } catch (error) {
        saveDirty = true;
        console.error("Save failed:", error);
    }
}

async function loadGame(user) {
    try {
        const saveRef = doc(db, "players", user.uid);
        const save = await getDoc(saveRef);

        if (save.exists()) {
            const data = save.data();

            stats = {
                ...stats,
                ...data.stats
            };

            for (let upgrade in upgrades) {
                if (data.upgrades?.[upgrade]) {
                    upgrades[upgrade].cost =
                        data.upgrades[upgrade].cost;

                    upgrades[upgrade].available =
                        data.upgrades[upgrade].available;
                }
            }
            document.getElementById("username").innerText = `User: ${user.email}`;
            console.log("Save loaded!");
        } else {
            console.log("New player! Creating save...");
            saveDirty = true;
        }

        gameReady = true;
        updatetext();

        // Create the first save for a new player
        await uploadSave();

    } catch (error) {
        gameReady = false;
        console.error("Couldn't load save:", error);
        authMessage.textContent = "Couldn't load your save. Please try again.";
    }
}


/* update text function */
function updatetext() {
    if (!gameReady) return;
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
    if (!gameReady) return;
    stats.coins += roundn(stats.coinsperclick)
    stats.tokens += roundn(stats.tokensperclick)
}

function aclick() {
    if (!gameReady) return;
    stats.coins += roundn(stats.acps) * roundn(((stats.cbstok / 100) + 1))
    stats.tokens += roundn(stats.autotokensperclick)
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
    if (gameReady && stats.autoclickerunl) {
        aclick();
        updatetext();
    }
}, 500);

/* ugrade functions */

ptokens.onclick = function () {
    if (!gameReady) return;
    if (stats.coins >= stats.UTcost) {
        stats.coins -= stats.UTcost
        stats.tokens += 1
        priceinc(stats.UTcost)

        stats.UTcost = priceinc(stats.UTcost)
        updatetext()
    }
}

cpsatok.onclick = function () {
    if (!gameReady) return;
    if (stats.tokens >= 1) {
        stats.tokens -= 1
        stats.cpstok += 1
        updatetext()
    }
}

cbsatok.onclick = function () {
    if (!gameReady) return;
    if (stats.tokens >= 1) {
        stats.tokens -= 1
        stats.cbstok += 1
        updatetext()
    }
}

cpsup1.onclick = function () {
    if (!gameReady) return;
    if (stats.cpstok >= upgrades["cpsup1"].cost && upgrades["cpsup1"].available) {
        stats.coinsperclick += roundn(0.3)
        upgrades["cpsup1"].available = false
        updatetext()
    }
}

cpsup2.onclick = function () {
    if (!gameReady) return;
    if (stats.cpstok >= upgrades["cpsup2"].cost && upgrades["cpsup2"].available) {
        stats.coinsperclick *= roundn(1.5)
        upgrades["cpsup2"].available = false
        updatetext()
    }
}

cpsup3.onclick = function () {
    if (!gameReady) return;
    if (stats.cpstok >= upgrades["cpsup3"].cost && upgrades["cpsup3"].available) {
        stats.tokensperclick += roundn(0.02)
        upgrades["cpsup3"].available = false
        updatetext()
    }
}

cpsup4.onclick = function () {
    if (!gameReady) return;
    if (stats.cpstok >= upgrades["cpsup4"].cost && upgrades["cpsup4"].available) {
        stats.coinsperclick += roundn(0.5)
        upgrades["cpsup4"].available = false
        updatetext()
    }
}

cbsup1.onclick = function () {
    if (!gameReady) return;
    if (stats.cbstok >= upgrades["cbsup1"].cost && upgrades["cbsup1"].available) {
        stats.autoclickerunl = true
        upgrades["cbsup1"].available = false
        updatetext()
    }
}

cbsup2.onclick = function () {
    if (!gameReady) return;
    if (stats.cbstok >= upgrades["cbsup2"].cost && upgrades["cbsup2"].available) {
        stats.autotokensperclick += roundn(0.01)
        upgrades["cbsup2"].available = false
        updatetext()
    }
}

// Register
document.getElementById("register-button").onclick = async function () {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        await register(email, password);
        authMessage.textContent = "Account created!";
        location.reload()
    } catch (error) {
        authMessage.textContent = error.message;
        console.error(error);
    }
};

// Login
document.getElementById("login-button").onclick = async function () {
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

// Logout
document.getElementById("logout-button").onclick = async function () {
    let result = confirm("do you wish to log out?")

    if (result) {
        await uploadSave();
        await logout();
    } else {
        console.log("user canceled")
    }
};

onAuthStateChanged(auth, async function (user) {
    currentUser = user;
    gameReady = false;

    if (user) {
        authContainer.hidden = true;
        accountContainer.hidden = true;

        await loadGame(user);

        document.getElementById("auth-overlay").style.display = "none";

    } else {
        authContainer.hidden = false;
        accountContainer.hidden = true;

        document.getElementById("auth-overlay").style.display = "flex";

        console.log("Not logged in");
    }
});

setInterval(function () {
    uploadSave();
}, 1000);