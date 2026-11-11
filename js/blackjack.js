import {
    stats,
    updatetext,
    roundn,
    abbreviate
} from "./game.js"

export var bidamt = 0;

export const bet = document.getElementById("bet")
const dhand = document.getElementById("dhand")
const yhand = document.getElementById("yhand")
const hit = document.getElementById("hit")
const stand = document.getElementById("stand")
const dhandtot = document.getElementById("dhandtot")
const yhandtot = document.getElementById("yhandtot")

// const dd = document.getElementById("dd")
// const split = document.getElementById("split")

const bid = document.getElementById("bid")

const bidoverlay = document.getElementById("bidoverlay")

const bidbtn = document.getElementById("bidbtn")
const bidamount = document.getElementById("bidamount")

const start = document.getElementById("start")

const restart = document.getElementById("restart")

const exitbtn = document.getElementById("closebtn")

// reset hand
dhand.innerText = `0 | 0`
yhand.innerText = `0 | 0`

var canbid = true
var isbidding = false

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var tempbidamt = 0

bidamount.innerText = tempbidamt

bid.addEventListener("click", () => {
    if (!isbidding && canbid) {
        bidoverlay.style.display = "flex"
        isbidding = true
        console.log("bidding")
    }
});

exitbtn.addEventListener("click", () => {
    if (isbidding && canbid) {
        bidoverlay.style.display = "none"
        isbidding = false
        tempbidamt = 0
        bidamount.innerText = tempbidamt
        console.log("ended bidding")
    }
});

document.querySelectorAll("[data-percentage]").forEach(Element => {
    Element.addEventListener("click", () => {
        if (stats.coins > 0) {
            tempbidamt = stats.coins * Number(Element.dataset.percentage);
            bidamount.innerText = abbreviate(roundn(tempbidamt))
        }
    });
});

bidbtn.addEventListener("click", () => {
    if (isbidding && canbid && tempbidamt != 0) {
        bidamt += Math.abs(Number(tempbidamt))
        bidoverlay.style.display = "none"
        isbidding = false
        canbid = false
        console.log("bid set")
        updatetext()
    }
});

var alreadystarted = false
var isitplayersturn = false

function dai(hand1, hand2, hand3) {
    if (hand1 + hand2 <= 17) {
        return hand1 + hand2 + hand3
    } else {
        return hand1 + hand2
    }
}

function tdai(hand1, hand2, hand3) {
    if (hand1 + hand2 <= 17) {
        dhand.innerText = `${hand1} | ${hand2} | ${hand3}`
    } else {
        dhand.innerText = `${hand1} | ${hand2}`
    }
}

var dhand1 = 0
var dhand2 = 0
var dhand3 = 0
var yhand1 = 0
var yhand2 = 0
var yhand3 = 0

dhandtot.innerHTML = `dealers hand: total amount: ${dhand1 + dhand2}`
yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2}`

var debounce = false

start.addEventListener("click", async () => {
    if (!isbidding && !canbid && !alreadystarted && !isitplayersturn) {
        dhand1 = getRndInteger(1, 11)
        dhand2 = getRndInteger(1, 11)
        dhand3 = getRndInteger(1, 11)
        yhand1 = getRndInteger(1, 11)
        yhand2 = getRndInteger(1, 11)
        yhand3 = getRndInteger(1, 11)
        dhand.innerText = `${dhand1} | #`
        yhand.innerText = `${yhand1} | ${yhand2}`
        alreadystarted = true
        isitplayersturn = true
        dhandtot.innerHTML = `dealers hand: total amount: ${dhand1}`
        yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2}`
    } else {
        alert("someting went wong: please bid first")
    }
});

hit.addEventListener("click", async () => {
    if (debounce) { return }
    debounce = true

    if (isitplayersturn && alreadystarted) {
        yhand.innerText = `${yhand1} | ${yhand2} | ${yhand3}`
        dhand.innerText = `${dhand1} | ${dhand2}`
        dhandtot.innerHTML = `dealers hand: total amount: ${dhand1 + dhand2}`
        yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2 + yhand3}`
        setTimeout(async () => {
            tdai(dhand1, dhand2, dhand3)
            dhandtot.innerHTML = `dealers hand: total amount: ${dai(dhand1, dhand2, dhand3)}`
            await sleep(3000)
            var psum = Math.abs(21 - (yhand1 + yhand2 + yhand3))
            var dsum = Math.abs(21 - dai(dhand1, dhand2, dhand3))
            console.log(psum, dsum)
            if (psum < dsum) {
                var winamt = bidamt * 2
                stats.coins += winamt
                await sleep(500)
                alert(`you won: ${abbreviate(roundn(winamt))}`)
            } else if (psum == dsum) {
                await sleep(500)
                alert(`a tie you get back your bid amount`)
            } else if (psum > dsum) {
                stats.coins -= bidamt
                await sleep(500)
                alert(`you lost: ${abbreviate(roundn(bidamt))}`)
            }
            dhand1 = 0
            dhand2 = 0
            dhand3 = 0
            yhand1 = 0
            yhand2 = 0
            yhand3 = 0
            alreadystarted = false
            isitplayersturn = false
            canbid = true
            bidamt = 0
            tempbidamt = 0
            bidamount.innerText = tempbidamt
            updatetext()
            dhand.innerText = `0 | 0`
            yhand.innerText = `0 | 0`
            dhandtot.innerHTML = `dealers hand: total amount: ${dhand1 + dhand2}`
            yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2 + yhand3}`
        }, 2000)
    }
    await sleep(5500)
    debounce = false
});

stand.addEventListener("click", async () => {
    if (debounce) { return }
    debounce = true

    if (isitplayersturn && alreadystarted) {
        dhand.innerText = `${dhand1} | ${dhand2}`
        dhandtot.innerHTML = `dealers hand: total amount: ${dhand1 + dhand2}`
        yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2}`
        setTimeout(async () => {
            tdai(dhand1, dhand2, dhand3)
            dhandtot.innerHTML = `dealers hand: total amount: ${dai(dhand1, dhand2, dhand3)}`
            yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2}`
            await sleep(3000)
            var psum = Math.abs(21 - (yhand1 + yhand2))
            var dsum = Math.abs(21 - dai(dhand1, dhand2, dhand3))
            console.log(psum, dsum)
            if (psum < dsum) {
                var winamt = bidamt * 2
                stats.coins += winamt
                await sleep(500)
                alert(`you won: ${abbreviate(roundn(winamt))}`)
            } else if (psum == dsum) {
                stats.coins += bidamt
                await sleep(500)
                alert(`a tie you get back your bid amount`)
            } else if (psum > dsum) {
                stats.coins -= bidamt
                await sleep(500)
                alert(`you lost: ${abbreviate(roundn(bidamt))}`)
            }
            dhand1 = 0
            dhand2 = 0
            dhand3 = 0
            yhand1 = 0
            yhand2 = 0
            yhand3 = 0
            alreadystarted = false
            isitplayersturn = false
            canbid = true
            bidamt = 0
            tempbidamt = 0
            bidamount.innerText = tempbidamt
            updatetext()
            dhand.innerText = `0 | 0`
            yhand.innerText = `0 | 0`
            dhandtot.innerHTML = `dealers hand: total amount: ${dai(dhand1, dhand2, dhand3)}`
            yhandtot.innerHTML = `your hand: total amount: ${yhand1 + yhand2}`
        }, 2000)
    }
    await sleep(5500)
    debounce = false
});