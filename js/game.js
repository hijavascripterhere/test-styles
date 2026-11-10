import {
    auth,
    db,
    register,
    login,
    logout,
    resetPassword,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "./firebase.js";

import {
    bet,
    bidamt
} from "./blackjack.js"

const authContainer = document.getElementById("auth-container");
const accountContainer = document.getElementById("account-container");

const authMessage = document.getElementById("auth-message");
const accountEmail = document.getElementById("account-email");

document.addEventListener("contextmenu", function (e) {
    e.preventDefault()
})

const CURRENT_VERSION = "v1.0.6";

export let stats = {
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
    username: "",
    currenversion: CURRENT_VERSION,
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
    },
    cbsup3: {
        cost: 35,
        available: true,
    },
    cbsup4: {
        cost: 45,
        available: true,
    }
}

var versiontext = document.getElementById("versiontext")

versiontext.innerHTML = `current version: ${stats.currenversion}`;

/* clicker upgrades */
upgrades.cpsup1.element = document.getElementById("cpsup1");
upgrades.cpsup2.element = document.getElementById("cpsup2");
upgrades.cpsup3.element = document.getElementById("cpsup3");
upgrades.cpsup4.element = document.getElementById("cpsup4");

/* autoclicker upgrades */
upgrades.cbsup1.element = document.getElementById("cbsup1");
upgrades.cbsup2.element = document.getElementById("cbsup2");
upgrades.cbsup3.element = document.getElementById("cbsup3");
upgrades.cbsup4.element = document.getElementById("cbsup4");

const button = document.getElementById("button")
var coins = document.getElementById("coins")
var currentcoins = document.getElementById("currentcoins")
var coinsperclick = document.getElementById("coinsperclick")
var tokens = document.getElementById("tokens")
var tokenperclick = document.getElementById("tokenperclick")
var ptokens = document.getElementById("ptokens")
var cps = document.getElementById("cps")
var user = document.getElementById("username")
const registeruser = document.getElementById("registeruser")

var balance = document.getElementById("Balance")

var cpstok = document.getElementById("cpstok")
var cpsatok = document.getElementById("cpsatok")

var cbsatok = document.getElementById("cbsatok")
var cbstok = document.getElementById("cbstok")

const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardMessage = document.getElementById("leaderboard-message");

let leaderboardCategory = "coins";

function roundn(num) {
    return Math.round(num * 100) / 100;
}

function abbreviate(num) {
    if (num >= 1e33) return (num / 1e30).toFixed(1) + "D";
    if (num >= 1e30) return (num / 1e30).toFixed(1) + "Nn";
    if (num >= 1e27) return (num / 1e27).toFixed(1) + "Sp";
    if (num >= 1e24) return (num / 1e24).toFixed(1) + "Sp";
    if (num >= 1e21) return (num / 1e21).toFixed(1) + "Sx";
    if (num >= 1e18) return (num / 1e18).toFixed(1) + "Qi";
    if (num >= 1e15) return (num / 1e15).toFixed(1) + "Qd";
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

    return num;
}

async function loadLeaderboard() {

    if (!currentUser) return;

    leaderboardMessage.textContent = "Loading...";
    leaderboardList.replaceChildren();

    try {

        const leaderboardQuery = query(
            collection(db, "leaderboard"),
            orderBy(leaderboardCategory, "desc"),
            limit(10)
        );

        const snapshot = await getDocs(leaderboardQuery);

        if (snapshot.empty) {
            leaderboardMessage.textContent = "No players yet!";
            return;
        }

        let index = 0;

        snapshot.forEach((playerDoc) => {

            const player = playerDoc.data();

            const entry = document.createElement("li");

            const value = player[leaderboardCategory] ?? 0;
            document.getElementById("currentcategory").innerHTML = `- ${leaderboardCategory} -`;

            entry.textContent =
                `${index + 1}. ${player.username || "Player"} - ${abbreviate(roundn(value))}`;

            leaderboardList.appendChild(entry);

            index++;

        });

        leaderboardMessage.textContent = "";

    } catch (error) {

        console.error("Leaderboard error:", error);
        leaderboardMessage.textContent = "Couldn't load leaderboard.";

    }
}

document.querySelectorAll("[data-leaderboard]").forEach(div => {

    div.onclick = function () {

        leaderboardCategory = this.dataset.leaderboard;

        loadLeaderboard();

    };

});

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


        // Update leaderboard
        const leaderboardRef = doc(db, "leaderboard", currentUser.uid);

        await setDoc(leaderboardRef, {
            username: stats.username || "Player",
            coins: stats.coins,
            UT: stats.tokens,
            coinsperclick: stats.coinsperclick * (stats.cpstok / 10) + 1,
            autoclicker: stats.acps * (stats.cbstok / 100) + 1,

            // Autoclicker runs every 500ms
            cps: stats.autoclickerunl
                ? stats.acps * ((stats.cbstok / 100) + 1) * 2
                : 0,

            updatedAt: serverTimestamp()
        });

        console.log("Game saved and leaderboard updated!");
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
export function updatetext() {
    if (!gameReady) return;
    for (let upgrade in upgrades) {
        if (upgrades[upgrade].available) {
            upgrades[upgrade].element.style.color = "white";
        } else if (!upgrades[upgrade].available) {
            upgrades[upgrade].element.style.color = "rgb(60,60,60)";
            upgrades[upgrade].element.style.pointerEvents = "none"
        }
    }
    coins.innerText = `${abbreviate(roundn(stats.coins))}`;
    currentcoins.innerHTML = `coins: ${abbreviate(roundn(stats.coins))}`
    coinsperclick.innerHTML = `coins per click: ${abbreviate(roundn(stats.coinsperclick * ((stats.cpstok / 10)) + 1))}`
    tokens.innerHTML = `UT: ${abbreviate(roundn(stats.tokens))}`
    cpstok.innerHTML = `Clicker - ${abbreviate(roundn(stats.cpstok))}`
    tokenperclick.innerHTML = `UT per click: ${abbreviate(roundn(stats.tokensperclick))}`
    ptokens.innerHTML = `UT cost: ${abbreviate(roundn(stats.UTcost))}`
    cbstok.innerHTML = `autoclicker - ${abbreviate(roundn(stats.cbstok))}`
    user.innerHTML = `User: ${stats.username}`
    balance.innerHTML = `Balance:<br>${abbreviate(roundn(stats.coins))}`
    bet.innerHTML = `bet:<br>${abbreviate(roundn(bidamt))}`
    savegame()
}


function priceinc(num) {
    return num *= 1.1
}

function click() {
    if (!gameReady) return;
    stats.coins += stats.coinsperclick * (stats.cpstok / 10) || stats.coinsperclick
    stats.tokens += stats.tokensperclick * (stats.cpstok / 100) || stats.tokensperclick
}

function aclick() {
    if (!gameReady) return;
    stats.coins += stats.acps * (stats.cbstok / 100)
    stats.tokens += stats.autotokensperclick * (stats.cbstok / 100)
}

/* update text on start of website */
updatetext()

registeruser.onclick = function () {
    var usr = prompt("enter your user")
    if (usr) {
        if (usr.length <= 15) {
            stats.username = usr
            updatetext()
        } else {
            alert("character limit is 15")
        }
    } else if (!usr) {
        alert("please enter something")
    }
}

button.onclick = function () {
    click()
    updatetext();
}

var cc = stats.coins

setInterval(function () {
    var newcc = stats.coins
    var upcc = newcc - cc

    cps.innerHTML = `coins per second: ${abbreviate(roundn(upcc))}`

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
        roundn(stats.autotokensperclick += 0.01)
        upgrades["cbsup2"].available = false
        updatetext()
    }
}

cbsup3.onclick = function () {
    if (!gameReady) return;
    if (stats.cbstok >= upgrades["cbsup3"].cost && upgrades["cbsup3"].available) {
        stats.acps += roundn(2)
        upgrades["cbsup3"].available = false
        updatetext()
    }
}

cbsup4.onclick = function () {
    if (!gameReady) return;
    if (stats.cbstok >= upgrades["cbsup4"].cost && upgrades["cbsup4"].available) {
        roundn(stats.acps *= 3)
        upgrades["cbsup4"].available = false
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
        setTimeout(() => {
            authMessage.textContent = "";
        }, 1000);
    } catch (error) {
        authMessage.textContent = error.message;
        console.error(error);
    }
};

// Logout
document.getElementById("logout-button").onclick = async function () {
    let result = confirm("do you wish to log out?")

    if (result) {
        localStorage.clear()
        await uploadSave();
        await logout();
    } else {
        console.log("user canceled")
    }
};

document.getElementById("forgotPassword").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();

    if (!email) {
        authMessage.textContent = "Enter your email first!";
        setTimeout(() => {
            authMessage.textContent = "";
        }, 1000);
        return;
    }

    try {
        await resetPassword(email);
        authMessage.textContent = "Password reset email sent! Check your inbox.";
        setTimeout(() => {
            authMessage.textContent = "";
        }, 1000);
    } catch (error) {
        console.error("Password reset error:", error);
        authMessage.textContent = "Couldn't send reset email: " + error.message;
        setTimeout(() => {
            authMessage.textContent = "";
        }, 1000);
    }
});

onAuthStateChanged(auth, async function (user) {
    currentUser = user;
    gameReady = false;

    if (user) {
        authContainer.hidden = true;
        accountContainer.hidden = true;

        await loadGame(user);
        await loadLeaderboard();
        document.getElementById("auth-overlay").style.display = "none";

    } else {
        authContainer.hidden = false;
        accountContainer.hidden = true;

        document.getElementById("auth-overlay").style.display = "flex";

        console.log("Not logged in");
    }
});

document.getElementById("leaderboard-refresh").onclick = function () {
    loadLeaderboard();
};

setInterval(function () {
    uploadSave();
}, 10000);