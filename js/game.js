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

let currentUser = null;
let gameReady = false;
let gameStarted = false;

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

document.getElementById("logout-button").onclick = async () => {
    try {
        await savegame();
        await logout();
    } catch (error) {
        console.error(error);
    }
};

document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

const defaultStats = {
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

const defaultUpgrades = {
    cpsup1: { cost: 1, available: true },
    cpsup2: { cost: 4, available: true },
    cpsup3: { cost: 10, available: true },
    cpsup4: { cost: 20, available: true },
    cbsup1: { cost: 10, available: true },
    cbsup2: { cost: 30, available: true }
};

// Actual game data
let stats = structuredClone(defaultStats);
let upgrades = structuredClone(defaultUpgrades);

// HTML elements are kept separate from save data
const upgradeElements = {
    cpsup1: document.getElementById("cpsup1"),
    cpsup2: document.getElementById("cpsup2"),
    cpsup3: document.getElementById("cpsup3"),
    cpsup4: document.getElementById("cpsup4"),
    cbsup1: document.getElementById("cbsup1"),
    cbsup2: document.getElementById("cbsup2")
};

const CURRENT_VERSION = "1.0.8b";

var versiontext = document.getElementById("versiontext");

versiontext.innerHTML = `newest version: ${CURRENT_VERSION}`;

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

let saveDirty = false;
let saveInProgress = false;

function getSaveData() {
    return {
        stats: stats,

        upgrades: Object.fromEntries(
            Object.entries(upgrades).map(([key, value]) => [
                key,
                {
                    cost: value.cost,
                    available: value.available
                }
            ])
        ),

        schemaVersion: 1,
        lastSaved: serverTimestamp()
    };
}

function markSaveDirty() {
    saveDirty = true;
}

async function savegame() {
    if (!currentUser || !saveDirty || saveInProgress) return;

    saveInProgress = true;
    saveDirty = false;

    try {
        const saveRef = doc(db, "players", currentUser.uid);

        await setDoc(saveRef, getSaveData(), { merge: true });

        console.log("Cloud save successful!");
    } catch (error) {
        saveDirty = true;
        console.error("Cloud save failed:", error);
    } finally {
        saveInProgress = false;
    }
}

async function loadGame(user) {
    const saveRef = doc(db, "players", user.uid);

    try {
        const snapshot = await getDoc(saveRef);

        if (snapshot.exists()) {
            const data = snapshot.data();

            // Restore stats, keeping defaults for any missing values
            stats = {
                ...structuredClone(defaultStats),
                ...data.stats
            };

            // Restore upgrades individually
            upgrades = structuredClone(defaultUpgrades);

            for (const key in upgrades) {
                if (data.upgrades?.[key]) {
                    upgrades[key] = {
                        ...upgrades[key],
                        ...data.upgrades[key]
                    };
                }
            }

            console.log("Cloud save loaded!");
        } else {
            // First time this player has logged in
            stats = structuredClone(defaultStats);
            upgrades = structuredClone(defaultUpgrades);

            console.log("No save found. Creating a new one.");
        }

        // Allow gameplay only after the save has loaded
        gameReady = true;

        updatetext();

        // Create the initial save if this was a new player
        if (!snapshot.exists()) {
            markSaveDirty();
            await savegame();
        }

    } catch (error) {
        gameReady = false;
        console.error("Could not load cloud save:", error);
        authMessage.textContent = "Couldn't load your save. Please try again.";
    }
}


/* update text function */
function updatetext() {

    // Update upgrade appearance
    for (let upgrade in upgrades) {
        const element = upgradeElements[upgrade];

        if (!element) continue;

        if (upgrades[upgrade].available) {
            element.style.color = "white";
        } else {
            element.style.color = "gray";
        }
    }

    coins.innerText = `${abbreviate(roundn(stats.coins))}$`;

    currentcoins.innerHTML =
        `coins: ${abbreviate(roundn(stats.coins))}$`;

    coinsperclick.innerHTML =
        `coins per click: ${abbreviate(roundn(stats.coinsperclick))}`;

    tokens.innerHTML =
        `UT: ${abbreviate(roundn(stats.tokens))}`;

    cpstok.innerHTML =
        `Clicker - ${abbreviate(roundn(stats.cpstok))}`;

    tokenperclick.innerHTML =
        `UT per click: ${abbreviate(roundn(stats.tokensperclick))}`;

    ptokens.innerHTML =
        `UT cost: ${abbreviate(roundn(stats.UTcost))}$`;

    cbstok.innerHTML =
        `autoclicker - ${abbreviate(roundn(stats.cbstok))}`;

    // Only mark changes once the game is running
    if (gameReady) {
        markSaveDirty();
    }
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
// Start the game only once, after loading the save
function startGame() {
    if (gameStarted) return;

    gameStarted = true;

    // Calculate coins earned per second
    let cc = stats.coins;

    setInterval(function () {
        if (!gameReady) return;

        const newcc = stats.coins;
        const upcc = newcc - cc;

        cps.innerHTML = `coins per second: ${roundn(upcc)}$`;

        cc = newcc;
    }, 1000);

    // Autoclicker
    setInterval(function () {
        if (!gameReady) return;

        if (stats.autoclickerunl) {
            aclick();
            updatetext();
        }
    }, 500);

    // Cloud save every 10 seconds, but only if something changed
    setInterval(function () {
        savegame();
    }, 10000);
}


// Main click button
button.onclick = function () {
    if (!gameReady) return;

    click();
    updatetext();
};


// Upgrade: Buy tokens
ptokens.onclick = function () {
    if (!gameReady) return;

    if (stats.coins >= stats.UTcost) {
        stats.coins -= stats.UTcost;
        stats.tokens += 1;

        stats.UTcost = priceinc(stats.UTcost);

        updatetext();
    }
};


// Upgrade: Clicker token
cpsatok.onclick = function () {
    if (!gameReady) return;

    if (stats.tokens >= 1) {
        stats.tokens -= 1;
        stats.cpstok += 1;

        updatetext();
    }
};


// Upgrade: Autoclicker token
cbsatok.onclick = function () {
    if (!gameReady) return;

    if (stats.tokens >= 1) {
        stats.tokens -= 1;
        stats.cbstok += 1;

        updatetext();
    }
};


// Upgrade: CPSUP1
cpsup1.onclick = function () {
    if (!gameReady) return;

    if (stats.cpstok >= upgrades.cpsup1.cost && upgrades.cpsup1.available) {
        stats.coinsperclick += 0.3;
        upgrades.cpsup1.available = false;

        updatetext();
    }
};


// Upgrade: CPSUP2
cpsup2.onclick = function () {
    if (!gameReady) return;

    if (stats.cpstok >= upgrades.cpsup2.cost && upgrades.cpsup2.available) {
        stats.coinsperclick *= 1.5;
        upgrades.cpsup2.available = false;

        updatetext();
    }
};


// Upgrade: CPSUP3
cpsup3.onclick = function () {
    if (!gameReady) return;

    if (stats.cpstok >= upgrades.cpsup3.cost && upgrades.cpsup3.available) {
        stats.tokensperclick += 0.02;
        upgrades.cpsup3.available = false;

        updatetext();
    }
};


// Upgrade: CPSUP4
cpsup4.onclick = function () {
    if (!gameReady) return;

    if (stats.cpstok >= upgrades.cpsup4.cost && upgrades.cpsup4.available) {
        stats.coinsperclick += 0.5;
        upgrades.cpsup4.available = false;

        updatetext();
    }
};


// Upgrade: CBSUP1
cbsup1.onclick = function () {
    if (!gameReady) return;

    if (stats.cbstok >= upgrades.cbsup1.cost && upgrades.cbsup1.available) {
        stats.autoclickerunl = true;
        upgrades.cbsup1.available = false;

        updatetext();
    }
};


// Upgrade: CBSUP2
cbsup2.onclick = function () {
    if (!gameReady) return;

    if (stats.cbstok >= upgrades.cbsup2.cost && upgrades.cbsup2.available) {
        stats.autotokensperclick += 0.01;
        upgrades.cbsup2.available = false;

        updatetext();
    }
};


// Listen for login/logout changes
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    gameReady = false;

    if (user) {
        authContainer.hidden = true;
        accountContainer.hidden = false;

        accountEmail.textContent = user.email;

        console.log("Logged in:", user.uid);

        await loadGame(user);

        if (gameReady) {
            startGame();
        }

    } else {
        authContainer.hidden = false;
        accountContainer.hidden = true;

        console.log("Not logged in");
    }
});