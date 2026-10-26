let stats = JSON.parse(
    localStorage.getItem("stats")
) || {
    coins: 0,
    coinsperclick: 0.1,
    tokens: 0
};

const button = document.getElementById("button")
var coins = document.getElementById("coins")

function updatetext() {
    let number = stats.coins
    number = Math.round(number * 100) / 100
    coins.innerText = abbreviate(number);
    savegame()
}

updatetext()

function savegame() {
    localStorage.setItem("stats", JSON.stringify(stats));
}

function abbreviate(num) {
    if (num >= 1e15) return (num / 1e15).toFixed(1) + "Q";
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";

    return num;
}

button.onclick = function () {
    stats.coins += stats.coinsperclick;
    updatetext();
}