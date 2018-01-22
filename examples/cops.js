const Blink1 = require('../blink1');
const Color = require('rgbcolor');

let d = Blink1.devices()[0];
let b = new Blink1(d);
callTheCops(new Color('red'), 1);
callTheCops(new Color('blue'), 2);

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
            newColor = new Color('blue');
        } else {
            newColor = new Color('red');
        }
        callTheCops(newColor, index);
    });
}
