const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const wol = require('wake_on_lan');
const bodyParser = require('body-parser');
const ping = require('ping');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
let servers = require('./servers.json');

console.clear();
console.log(`
    ██╗      ██████╗ ██╗   ██╗    ███╗   ███╗██████╗ ██████╗
    ╚██╗     ██╔══██╗╚██╗ ██╔╝    ████╗ ████║╚════██╗╚════██╗
     ╚██╗    ██████╔╝ ╚████╔╝     ██╔████╔██║ █████╔╝ █████╔╝
     ██╔╝    ██╔══██╗  ╚██╔╝      ██║╚██╔╝██║██╔═══╝  ╚═══██╗
    ██╔╝     ██████╔╝   ██║       ██║ ╚═╝ ██║███████╗██████╔╝
    ╚═╝      ╚═════╝    ╚═╝       ╚═╝     ╚═╝╚══════╝╚═════╝                                                
`);
console.log("WOL-Manager V1.0")

// Check server status every 30 seconds and attempt wake-up if down
setInterval(() => {
  servers.forEach((server, index) => {
    if (server.autoMode) {
      checkAndWake(server, index);
    }
  });
}, 30000);

async function checkServerStatus(ip) {
  try {
    const result = await ping.promise.probe(ip, { timeout: 5 });

    if (result.alive) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.warn("Error while pinging ", ip)
    return false
  }
}

function attemptWake(server, retries) {
  if (retries === 0) return 0;
  wol.wake(server.mac, (err) => {
    if (err) {
      console.error(`Failed to wake ${server.name}:`, err);
    } else {
      console.log(`Wake packet sent to ${server.name}`);
      setTimeout(() => attemptWake(server, retries - 1), 30000);
    }
  });
}

async function checkAndWake(server, index) {
  try {
    let resultPing = await ping.promise.probe(server.ip, { timeout: 5 });
    if (!resultPing) {
      console.log("Server ", server.name, " (", server.ip, ") is DOWN! Trying to Wake...")
      const resultWake = attemptWake(server, 3)
      resultPing = await ping.promise.probe(server.ip, { timeout: 5 });

      if (resultWake == 0) {
        if (!resultPing) {
          console.log("Server ", server.name, " (", server.ip, ") is DOWN! Failed to Wake!")
        } else {
          console.log("Server ", server.name, " (", server.ip, ") is UP!")
        }
      }
    }

  } catch (error) {
    console.log(`${server.name} is down. Attempting to wake up...`);
    attemptWake(server, 3);
  }
}

// API to get servers
app.get('/api/servers', async (req, res) => {
  const serversWithoutStatus = servers.map(server => {
    return { ...server };
  });
  res.json(serversWithoutStatus);
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
  console.log(server)
  wol.wake(server.mac, (err) => {
    if (err) {
      console.log("Err")
      res.status(500).send('Failed to send WOL packet');
    } else {
      console.log("Sent")
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

// API to remove a server
app.delete('/api/servers/:index', (req, res) => {
  const index = req.params.index;
  if (index < 0 || index >= servers.length) {
    return res.status(400).send('Invalid index');
  }
  servers.splice(index, 1);
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.send('Server removed');
});

app.get('/api/status/:index?', async (req, res) => {
  const { index } = req.params;

  if (index === undefined) {
    // No index provided, return status for all servers
    const serverStatusPromises = servers.map(async (server) => {
      const isOnline = await checkServerStatus(server.ip);
      return { ...server, isOnline };
    });

    const allServersWithStatus = await Promise.all(serverStatusPromises);
    res.json(allServersWithStatus);
  } else {
    // Index provided, return status for a specific server
    const server = servers[index];

    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const isOnline = await checkServerStatus(server.ip);
    res.json({ ...server, isOnline });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
