import {
    stats,
    updatetext
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

// reset hand
dhand.innerText = `0 | 0`
yhand.innerText = `0 | 0`

var canbid = true
var isbidding = false

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



bid.addEventListener("click", () => {
    if (!isbidding && canbid) {
        bidoverlay.style.display = "flex"
        isbidding = true
    }
});


bidbtn.addEventListener("click", () => {
    if (bidamount && stats.coins >= bidamount.value) {
        stats.coins -= Number(bidamount.value)
        bidamt += Number(bidamount.value)
        bidoverlay.style.display = "none"
        isbidding = false
        canbid = false
        updatetext()
    }
})

var alreadystarted = false
var isitplayersturn = 0
var isplayerstanding = false
var isplayerhitting = false


function dai(hand1, hand2, hand3) {
    if (hand1, hand2 <= 17) {
        dhand.innerText = `${hand1} | ${hand2} | ${hand3}`
    } else {
        dhand.innerText = `${hand1} | ${hand2}`
    }

}

start.addEventListener("click", () => {
    if (!isbidding && !canbid && !alreadystarted && isitplayersturn == 0) {
        var dhand1 = getRndInteger(1, 11)
        var dhand2 = getRndInteger(1, 11)
        var dhand3 = getRndInteger(1, 11)
        var yhand1 = getRndInteger(1, 11)
        var yhand2 = getRndInteger(1, 11)
        var yhand3 = getRndInteger(1, 11)
        dhand.innerText = `${dhand1} | #`
        yhand.innerText = `${yhand1} | ${yhand2}`
        alreadystarted = true
        isitplayersturn = true
        hit.addEventListener("click", () => {
            if (isitplayersturn) {
                isplayerhitting = true
                yhand.innerText = `${yhand1} | ${yhand2} | ${yhand3}`
                dhand.innerText = `${dhand1} | ${dhand2}`
                isitplayersturn = false
                setTimeout(() => {
                    dai(dhand1, dhand2, dhand3)
                    var psum = 21 - (yhand1 + yhand2) || (yhand1 + yhand2) - 21
                    var dsum = 21 - (dhand1 + dhand2) || (dhand1 + dhand2) - 21

                    if (psum < dsum) {
                        stats.coins += bidamt * 1.2
                        setTimeout(() => {
                            alert("you won, click restart")
                        })
                    } else {
                        setTimeout(() => {
                            alert("you lost, click restart")
                        }, 1000)
                    }
                    alreadystarted = false
                    isitplayersturn = false
                    updatetext()
                    console.log(psum, dsum)
                }, 2000)
            }
        })

        stand.addEventListener("click", () => {
            if (isitplayersturn) {
                isplayerstanding = true
                dhand.innerText = `${dhand1} | ${dhand2}`
                isitplayersturn = false
                setTimeout(() => {
                    dai(dhand1, dhand2, dhand3)
                    var psum = 21 - (yhand1 + yhand2) || (yhand1 + yhand2) - 21
                    var dsum = 21 - (dhand1 + dhand2) || (dhand1 + dhand2) - 21

                    if (psum < dsum) {
                        stats.coins += bidamt * 1.2
                        setTimeout(() => {
                            alert("you won, click restart")
                        })
                    } else {
                        setTimeout(() => {
                            alert("you lost, click restart")
                        }, 1000)
                    }
                    alreadystarted = false
                    isitplayersturn = false
                    updatetext()
                    console.log(psum, dsum)
                }, 2000)
            }
        })

        restart.addEventListener("click", () => {
            if (!alreadystarted && !isbidding) {
                location.reload()
            }
        });

    } else {
        alert("someting went wong")
    }
});