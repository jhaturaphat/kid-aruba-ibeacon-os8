const WebSocket = require('ws');
const aruba_telemetry_proto = require('../../aruba/aruba_iot_proto').aruba_telemetry;
const Sensor = require('../models/sensorModel.js');

let wss;

exports.initWebsocket = (server) => {
    wss = new WebSocket.Server({server});
    // สร้าง connection
    wss.on('connection',(ws) => {
        ws.on('message',(message) => {
            try {
                let telemetryReport = aruba_telemetry_proto.Telemetry.decode(message);
                let bleobj = JSON.stringify(telemetryReport);
                let ble = JSON.parse(bleobj);
                // console.log(bleobj);
                if(!ble["reported"]){
                    // console.log("Aruba Websocket Established");
                }else{
                    console.log("================Start===============");
                    console.log(bleobj);
                    console.log(ble["reporter"]["name"]);
                    //console.log(obj["reporter"]["ipv4"]);
                    console.log(ble["reported"]);
                    //console.log(obj.reported);
                    Sensor.create(ble["reporter"]["name"], ble.reported);
                    //console.log(obj.reported[0]["deviceClass"]);
                    let count=0;
                    for (k of ble.reported) {        
                    console.log(ble.reported[count]["deviceClass"]);
                    console.log(`=================${count}==================`);
                    if(ble.reported[count]["deviceClass"].includes('iBeacon')==true){
                        console.log(ble.reported[count]["beacons"][0]['ibeacon']['uuid']);
                        console.log('iBaecon');
                    }
                    if(ble.reported[count]["deviceClass"]=='arubaTag'){
                        console.log('ArubaTag');
                    }
                    count +=1;
                    console.log("================End===============");
                    }
                }
            } catch (error) {
                console.log(error);                    
            }
            ws.send(`Server received: ${message}`);
        });
        // เมื่อ client ปิดการเชื่อมต่อ
    ws.on('close', () => {
        console.log('Client has disconnected');
    });
    });
};

exports.broadcast = (data) => {
    if (!wss) return;
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };