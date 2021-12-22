const Device = require('./device.js');
const args = process.argv.slice(2);
const find = require('local-devices');

const interf = args[2] | "eth0"

if (args[0] && args[1]) {
    Device.discover(args[0], args[1], interf).then(async (cams) => {
        await cams.forEach(async (cam,num) => {
            if (cam.onvif instanceof Error) { 
                console.log("Onvif connect errored. Check username and password on cam",cam.hostname)
            } else {
                find(cam.onvif.hostname).then(device => {
                    console.log("======================")
                    console.log(cam.onvif.deviceInformation.manufacturer, cam.onvif.deviceInformation.model)
                    console.log("IP:", cam.onvif.hostname)
                    console.log("MAC:", device.mac)
                    console.log("RTSP URI:",cam.onvif.profiles[0].streamUri)
                    console.log("Resolution:",cam.onvif.videoSources[0].resolution)
                })
            }
        })
    })
} else {
    console.log("Usage: node main.js [username] [password] {interface}")
}
