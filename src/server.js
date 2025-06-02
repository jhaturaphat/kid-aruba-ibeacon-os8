// Import Modules
require('dotenv').config()
const http = require('http');
const express = require('express');


const websocketService = require('./services/websocketService');

// Middleware
const app = express();
app.use(express.json());
// สร้าง HTTP server
const server = http.createServer(app);
// เริ่มต้น WebSocket

// Routes
app.get('/users', async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Setup WebSocket
websocketService.initWebsocket(server)

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is also running on the same port`);
});



