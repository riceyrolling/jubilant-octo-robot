const Device = require('./device.js');
const args = process.argv.slice(2);
const find = require('local-devices');

if (args[0] && args[1]) {
    Device.discover(args[0], args[1]).then(async (cams) => {
        await cams.forEach(async (cam,num) => {
            if (cam.onvif instanceof Error) { 
                console.log("Onvif connect errored. Check username and password on cam",num)
            } else {
                find(cam.onvif.hostname).then(device => {
                    console.log("======================")
                    console.log(cam.onvif.deviceInformation.manufacturer, cam.onvif.deviceInformation.model)
                    console.log("IP:", cam.onvif.hostname)
                    console.log("MAC:", device.mac)
                    console.log("RTSP URI:",cam.streams[0].streamUri)
                    console.log("Resolution:",cam.streams[0].resolution)
                })
            }
        })
    })
} else {
    console.log("Usage: main.js [username] [password]")
}