const Blink1 = require('../blink1');
const Color = require('rgbcolor');

let d = Blink1.devices()[0];
let b = new Blink1(d);
callTheCops({r: 255, g: 0, b: 0}, 1);
callTheCops({r: 0, g: 0, b: 255}, 2);

function callTheCops(color, index) {
    b.fadeToRGB({
        color,
        delay: 100,
        index,
        callback: (data) => {
            console.log("finished", data);
        }
    }).then(data => {
        if (data.color.r == 255) {
            newColor = {r: 0, g: 0, b: 255};
        } else {
            newColor = {r: 255, g: 0, b: 0};
        }
        callTheCops(newColor, index);
    });
}
