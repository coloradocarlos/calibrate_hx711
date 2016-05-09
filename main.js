/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)

// Calibration routine ported from https://codebender.cc/sketch:123175#SparkFun_HX711_Calibration.ino

var hx711 = require('jsupm_hx711');// Instantiate a HX711 data on digital pin D3 and clock on digital pin D2

// Arduino mapping
var DATA_SHIELD = 3; // Arduino shield
var CLOCK_SHIELD = 2; // Arduino shield

// MRAA mapping
var DATA_MRAA = 20; // GPIO block GP12
var CLOCK_MRAA = 13; // GPIO block GP128

var scale = new hx711.HX711(DATA_SHIELD, CLOCK_SHIELD);

var calibrationFactor = 910.0 // Seeed Studio 5kg
// var calibrationFactor = 340.0 // 5kg Taylor load cell

// Set to true when Ctrl-C entered
var doneCalibration = false;

// Keyboard input setup
var keypress = require('keypress');
var tty = require('tty');

var rc = setupKeyboard();
if (!rc) {
    return;
}

setupHX711();

periodicActivity();

function setupKeyboard() {
    // make `process.stdin` begin emitting "keypress" events
    keypress(process.stdin);

    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
        if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
            doneCalibration = true;
        } else if (ch == '+' || ch == 'a') {
            calibrationFactor += 10.0;
        } else if (ch == '-' || ch == 'z') {
            calibrationFactor -= 10.0;
        }
    });

    if (typeof process.stdin.setRawMode == 'function') {
        process.stdin.setRawMode(true);
    } else {
        try {
            tty.setRawMode(true);
        } catch (ex) {
            console.log("This script must be run from command line, not xdk-daemon!");
            return false;
        }
    }
    process.stdin.resume();
    return true;
}

// Call to setup device
function setupHX711() {
    console.log("HX711 calibration node.js");
    console.log("Remove all weight from scale");
    console.log("After readings begin, place known weight on scale");
    console.log("Press + or a to increase calibration factor");
    console.log("Press - or z to decrease calibration factor");
    
//    console.log("... call setGain()");
//    scale.setGain(128);
    
    console.log("... call setScale()");
    scale.setScale(1.0);
    
    console.log("... call tare()");
    scale.tare(20);
    
    console.log("... call tare() again");
    scale.tare(20);
    
    var zeroFactor = scale.readAverage(10); // Get a baseline reading
    console.log("Zero factor: " + zeroFactor); //This can be used to remove the need to tare the scale. Useful in permanent scale projects.
    
    console.log("Put a known weight on the scale at this time..")
}

function periodicActivity() {
    scale.setScale(calibrationFactor); //Adjust to this calibration factor
    
    var units = scale.getUnits();
    //Change this to kg and re-adjust the calibration factor if you follow SI units like a sane person
    console.log("Reading: " + units + " g calibration factor: " + calibrationFactor);

    if (!doneCalibration) {
        setTimeout(periodicActivity, 2000);
    } else {
        console.log("All done!");
    }
}