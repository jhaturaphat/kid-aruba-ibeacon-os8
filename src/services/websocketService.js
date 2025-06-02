const WebSocket = require('ws');
const fs = require('node:fs');
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
                let sensor = JSON.parse(bleobj);
                
                // if(sensor.reported){
                //   console.log(bleobj); 
                // }
                // ส่งไปยัง sensorModel เพื่อบันทึก               
                Sensor.create(sensor);   
               
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