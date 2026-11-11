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

bid.addEventListener("click", () => {
    if (!isbidding && canbid) {
        bidoverlay.style.display = "flex"
        isbidding = true
    }
});

exitbtn.addEventListener("click", () => {
    if (isbidding && canbid) {
        bidoverlay.style.display = "none"
        isbidding = false
        bidamount.value = ""
    }
});


bidbtn.addEventListener("click", () => {
    if (stats.coins >= bidamount.value) {
        bidamt += Math.abs(Number(bidamount.value))
        bidoverlay.style.display = "none"
        isbidding = false
        canbid = false
        updatetext()
    }
})

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

    } else {
        alert("someting went wong: please bid first")
    }
});

hit.addEventListener("click", async () => {
    if (debounce) {return}
    debounce = true

    if (isitplayersturn && alreadystarted) {
        yhand.innerText = `${yhand1} | ${yhand2} | ${yhand3}`
        dhand.innerText = `${dhand1} | ${dhand2}`
        setTimeout(async () => {
            tdai(dhand1, dhand2, dhand3)
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
                alert(`you lost: ${bidamt}`)
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
            updatetext()
            dhand.innerText = `0 | 0`
            yhand.innerText = `0 | 0`
        }, 2000)
    }
    await sleep(5500)
    debounce = false
});

stand.addEventListener("click", async () => {
    if (debounce) {return}
    debounce = true
    if (isitplayersturn && alreadystarted) {
        dhand.innerText = `${dhand1} | ${dhand2}`
        setTimeout(async () => {
            tdai(dhand1, dhand2, dhand3)
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
                alert(`you lost: ${bidamt}`)
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
            updatetext()
            dhand.innerText = `0 | 0`
            yhand.innerText = `0 | 0`
        }, 2000)
    }
    await sleep(5500)
    debounce = false
});