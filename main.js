const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const wol = require('wake_on_lan');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

let servers = require('./servers.json');

// Check server status every 30 seconds and attempt wake-up if down
setInterval(() => {
  servers.forEach((server, index) => {
    if (server.autoMode) {
      checkAndWake(server, index);
    }
  });
}, 30000);

async function checkAndWake(server, index) {
  try {
    const response = await fetch(`http://${server.ip}`, { timeout: 5000 });
    if (!response.ok) throw new Error('Server down');
  } catch (error) {
    console.log(`${server.name} is down. Attempting to wake up...`);
    attemptWake(server, 3);
  }
}

function attemptWake(server, retries) {
  if (retries === 0) return;
  wol.wake(server.mac, (err) => {
    if (err) {
      console.error(`Failed to wake ${server.name}:`, err);
    } else {
      console.log(`Wake packet sent to ${server.name}`);
      setTimeout(() => attemptWake(server, retries - 1), 30000);
    }
  });
}

// API to get servers
app.get('/api/servers', (req, res) => {
  res.json(servers);
});

// API to add a new server
app.post('/api/servers', (req, res) => {
  const { name, ip, mac, autoMode } = req.body;
  servers.push({ name, ip, mac, autoMode });
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.status(201).send('Server added');
});

// API to manually send WOL packet
app.post('/api/wake/:index', (req, res) => {
  const server = servers[req.params.index];
  wol.wake(server.mac, (err) => {
    if (err) {
      res.status(500).send('Failed to send WOL packet');
    } else {
      res.send('Wake packet sent');
    }
  });
});

// API to toggle auto mode
app.post('/api/toggle/:index', (req, res) => {
  servers[req.params.index].autoMode = !servers[req.params.index].autoMode;
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.send('Auto mode toggled');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});