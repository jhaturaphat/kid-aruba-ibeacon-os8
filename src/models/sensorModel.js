const pool = require('../config/db.js');

const Sensor = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM sensor');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create(sensor) {
    // กรองข้อมูล sensor ที่ต้องการ
    if(sensor.hasOwnProperty('reported')){
      
      for(const item of sensor.reported){
        // console.log(sensor.reported.beacons);
        
        
        const params = [];
          // item.beacons[0]?.ibeacon?.uuid ?? null,
          // item.localName ?? null,
          // item.mac ?? null,
          // item.model ?? null,
          // item.beacons[0]?.ibeacon?.major ?? null, 
          // item.beacons[0]?.ibeacon?.minor ?? null,
          // null,
          // null,
          // item.beacons[0]?.ibeacon?.power ?? null,
          // rssi,          
          
          let distanc = 0;
        // if(item.deviceClass[0]?.includes('eddystone') 
        //   && item.beacons[0]?.eddystone.hasOwnProperty('uid')){
        //   const rssi = item.rssi?.avg ?? item.rssi?.bulk ?? item.rssi?.last ?? item.rssi?.max ?? item.rssi?.smooth ?? null;
        //   params.push(item.beacons[0]?.eddystone.uid?.nid ?? null);
        //   params.push(item.localName ?? null);
        //   params.push(item.mac ?? null ?? null)
        //   params.push(item.deviceClass[0] ?? null);
        //   params.push(null);
        //   params.push(null);
        //   params.push(null);
        //   params.push(item.sensors.temperatureC ?? null);
        //   params.push(item.beacons[0]?.eddystone.power ?? null);
        //   params.push(rssi)
        //   params.push(sensor.reporter.name ?? null);
        //   params.push(sensor.reporter.mac ?? null);
        //   params.push(sensor.reporter.hwType ?? null);
        //   distanc = this.calculateDistance(rssi, item.beacons[0]?.ibeacon?.power, 3.2);
        //   // console.log(rssi);
        //   // return;
            
        // }else 
        if(item.deviceClass[0]?.includes('iBeacon')) {
          const rssi = item.rssi?.avg ?? item.rssi?.bulk ?? item.rssi?.last ?? item.rssi?.max ?? item.rssi?.smooth ?? null;
          params.push(item.beacons[0]?.ibeacon?.uuid ?? null);
          params.push(item.localName ?? null)
          params.push(item.mac ?? null ?? null)
          params.push(item.model ?? null)
          params.push(item.beacons[0]?.ibeacon?.major ?? null)
          params.push(item.beacons[0]?.ibeacon?.minor ?? null)
          params.push(null)
          params.push(null)
          params.push(item.beacons[0]?.ibeacon?.power ?? null)
          params.push(rssi)
          params.push(sensor.reporter.name ?? null);
          params.push(sensor.reporter.mac ?? null);
          params.push(sensor.reporter.hwType ?? null);
          distanc = this.calculateDistance(rssi, item.beacons[0]?.ibeacon?.power, 3.2);
        }
        
       
        const sql = `INSERT INTO sensors 
        (s_uuid, s_name, s_mac_address, s_device_type, s_major, s_minor, s_battery, s_dynamic_value, s_tx_power, s_rssi, ap_name, ap_mac_address, ap_hw_type)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`;  
        if(params.length > 0){
          await pool.query(sql, params);   
          const ENVIRONMENTAL_FACTOR_N = 3.2;        
          console.log(`Insert complete. ${item.localName} ระยะห่าง ${distanc.toFixed(2)} เมตร`);
        } 
      }
    }
  },

  calculateDistance(rssi, txPower, n) {
    if (rssi >= txPower) {
      return 0; // Very close, or RSSI is stronger than at 1 meter, assume 0 distance for practical purposes
    }
  
    // Formula: distance = 10^((TxPower - RSSI) / (10 * N))
    const exponent = (txPower - rssi) / (10 * n);
    const distance = Math.pow(10, exponent);
  
    return distance;
  }
};

module.exports = Sensor;