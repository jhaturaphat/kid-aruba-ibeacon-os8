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

  async create(location, sensor) {
    // กรองข้อมูล sensor ที่ต้องการ
    try {
        const validSensors = sensors.filter(sensor => 
            sensor.deviceClass?.includes('iBeacon') && 
            !sensor.deviceClass?.includes('arubaBeacon') && 
            sensor.rssi != null
          );
    } catch (error) {
        console.error('Error processing sensors:', error);
    }
  }
};

module.exports = Sensor;