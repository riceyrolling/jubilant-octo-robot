"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var onvif = require('onvif');
var mac = require('mac-lookup');
var local_devices_1 = require("local-devices");
var os = require('os');
//////////////////////////////////////////////////////
function addAuthUri(uri, user, pass) {
    var str = user + ":" + pass + "@";
    return uri.slice(0, 7) + str + uri.slice(7 + Math.abs(0));
}
;
////////////////////////////////////////////////////
var Device = /** @class */ (function () {
    function Device(onvifRes, deviceConf) {
        var _this = this;
        this.display = deviceConf.display;
        this.playStream = deviceConf.defaultStream;
        // define what the important values are based on the results from onvif or general network scan.
        if (onvifRes) {
            this.onvif = onvifRes;
            this.name = onvifRes.deviceInformation.serialNumber; // add some more logic here in future to work out better names if available.
            // For each video source
            this.streams = onvifRes.profiles.map(function (profile, i) {
                var videoSource = _this.onvif.videoSources.filter(function (videoConfig) {
                    return videoConfig.$.token === profile.videoSourceConfiguration.$.token;
                });
                if (profile.videoEncoderConfiguration.hasOwnProperty("resolution")) {
                    var resolution = {
                        width: profile.videoEncoderConfiguration.resolution.width,
                        height: profile.videoEncoderConfiguration.resolution.height
                    };
                }
                else {
                    var resolution = {
                        width: videoSource[0].resolution.width,
                        height: videoSource[0].resolution.height
                    };
                }
                if (profile.videoEncoderConfiguration.hasOwnProperty("rateControl")) {
                    var framerate = profile.videoEncoderConfiguration.rateControl.frameRateLimit;
                }
                else {
                    var framerate = videoSource[0].framerate;
                }
                // Add username and password to streamURI
                if (onvifRes.password != null)
                    var streamUri = addAuthUri(profile.streamUri, _this.onvif.username, _this.onvif.password);
                else
                    var streamUri = profile.streamUri;
                return {
                    profile: profile.$.token,
                    frameRate: framerate,
                    playRate: 15,
                    playQuality: 12,
                    resolution: {
                        w: resolution.width,
                        h: resolution.height
                    },
                    streamUri: streamUri
                };
            });
        }
    }
    // Build function to allow async processing before class constructor.
    Device.build = function (host, u, p, defaultStream, displayPos) {
        return __awaiter(this, void 0, void 0, function () {
            var onvifRes, deviceConf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, onvifCam(host, u, p)];
                    case 1:
                        onvifRes = _a.sent();
                        if (onvifRes instanceof Error) {
                            return [2 /*return*/, {
                                    error: onvifRes.message,
                                    position: displayPos
                                }];
                        }
                        deviceConf = {
                            display: {
                                position: displayPos,
                                stretch: false // for testing
                            },
                            defaultStream: defaultStream
                        };
                        return [2 /*return*/, new Device(onvifRes, deviceConf)];
                }
            });
        });
    };
    Device.discover = function (u, p, interf) {
        if (u === void 0) { u = null; }
        if (p === void 0) { p = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Onvif Device discovery.
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        onvif.Discovery.on('error', function (err, xml) {
                            reject();
                        });
                        onvif.Discovery.probe({
                            device: interf
                        }, function (err, cams) { return __awaiter(_this, void 0, void 0, function () {
                            var camsDetailed;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(u != null && p != null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, cams.map(function (cam) {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    var _a;
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                cam.username = u;
                                                                cam.password = p;
                                                                _a = cam;
                                                                return [4 /*yield*/, onvifCam(cam.hostname, u, p)];
                                                            case 1:
                                                                _a.onvif = _b.sent();
                                                                return [2 /*return*/, cam];
                                                        }
                                                    });
                                                });
                                            })];
                                    case 1:
                                        camsDetailed = _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        // function will be called only after timeout (5 sec by default)
                                        if (err) {
                                            throw err;
                                        }
                                        Promise.all(camsDetailed).then(function (values) {
                                            resolve(values);
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    // Returns true if camera connects.
    Device.connect = function (cam) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        new onvif.Cam({
                            hostname: cam.onvif.hostname,
                            username: cam.onvif.username,
                            password: cam.onvif.password
                        }, function (err) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (err) {
                                        console.error(new Error(err.code));
                                        resolve(false);
                                    }
                                    else {
                                        resolve(true);
                                    }
                                    return [2 /*return*/];
                                });
                            });
                        });
                    })];
            });
        });
    };
    Device.init = function (socket) {
        socket.on("discover", function (answer) {
            return Device.discover();
        });
    };
    return Device;
}());
/////////////////////////////////////////////////
var onvifCam = function (host, u, p) {
    return new Promise(function (resolve) {
        new onvif.Cam({
            hostname: host,
            username: u,
            password: p
        }, function (err) {
            return __awaiter(this, void 0, void 0, function () {
                var streamUri, deviceInfo;
                var _this = this;
                return __generator(this, function (_a) {
                    if (err) {
                        resolve(new Error(err.code));
                        return [2 /*return*/];
                    }
                    streamUri = this.profiles.map(function (profile) {
                        return new Promise(function (getStreamUri) {
                            _this.getStreamUri({
                                profileToken: profile.$.token,
                                protocol: 'RTSP'
                            }, function (err, stream) {
                                if (err) {
                                } else {
                                    getStreamUri(stream.uri);
                                });
                        });
                    });
                    deviceInfo = new Promise(function (getDeviceInfo) {
                        _this.getDeviceInformation(function (err, info) {
                            if (err) {
                            }
                            getDeviceInfo(info);
                        });
                    });
                    Promise.all([deviceInfo, Promise.all(streamUri)]).then(function (result) {
                        result[1].forEach(function (uri, i) {
                            _this.profiles[i].streamUri = uri;
                        });
                        resolve(_this);
                    });
                    return [2 /*return*/];
                });
            });
        });
    });
};
function networkScan() {
    var netlist;
    // search network for all devices obj(name,ip,mac)
    local_devices_1.default().then(function (devices) {
        // for each device, return mac manufacturer, ip.
        netlist = devices.map(function (device) {
            mac.lookup(device.mac, function (err, name) {
                if (err)
                    throw err;
                return {
                    name: device.name,
                    ip: device.ip,
                    mac: device.mac,
                    manufacturer: name
                };
            });
        });
    });
}
module.exports = Device;
