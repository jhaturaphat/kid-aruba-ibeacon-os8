const WebSocket = require('ws');
const fs = require('node:fs');
const aruba_telemetry_proto = require('../../aruba/aruba_iot_proto').aruba_telemetry;
const Sensor = require('../models/sensorModel.js');
const { BufferReader } = require('protobufjs');

let wss;
let clientFilters = new Map();

exports.initWebsocket = (server) => {
    wss = new WebSocket.Server({server});    
    // สร้าง connection
    wss.on('connection',(ws) => {
        ws.on('message',(message) => {  
            
            const raw = message.toString(); // แปลง Buffer เป็น string

            try {
              const json = JSON.parse(raw); // ลอง parse JSON ก่อน
          
              // ✅ ถ้า parse สำเร็จ → แสดงว่า "client" ส่งมา
              if (json.type === 'filter') {
                clientFilters.set(ws, {
                  building: json.building,
                  floor: json.floor
                });
                ws.send(`✅ Filter updated: building=${json.building}, floor=${json.floor}`);
              } else {
                console.log("📩 Client message:", json);
              }
          
              return; // ออกเลย ไม่ต้อง decode ต่อ
            } catch (err) {
                // ❌ JSON.parse ไม่ได้ → น่าจะเป็น binary → ให้ลอง decode ด้วย Protobuf
                let telemetryReport = aruba_telemetry_proto.Telemetry.decode(message);
                let bleobj = JSON.stringify(telemetryReport);
                let sensor = JSON.parse(bleobj);
                if(sensor.reported){
                    // console.log(sensor.reporter.mac);
                    this.broadcast(sensor)
                }
            }

            // ws.send(`Server received: ${message}`);
        });
        // เมื่อ client ปิดการเชื่อมต่อ
    ws.on('close', () => {
        console.log('Client has disconnected');
    });
    });
};

exports.broadcast = (sensor) => {
    if (!wss) return;    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const filter = clientFilters.get(client) || {};       
        
        console.log("sensor ",sensor.reporter.mac);
        console.log("filter ", filter.building);
        if(filter.building && typeof filter.building === 'object'){
            const isMatched = Object.values(filter?.building ?? {}).includes(sensor.reporter.mac);
            if(isMatched){ // ส่งต่อให้เฉพาะ client ที่สนใจอาคาร/ชั้นนี้            
                client.send(JSON.stringify(sensor)); // ✅
            }
        }        
      }
    });
  };