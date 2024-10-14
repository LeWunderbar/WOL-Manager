// WOL-MANAGER | Backend | main.js

// MODULES //
const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const wol = require('wake_on_lan');
const bodyParser = require('body-parser');
const ping = require('ping');

// VARS //
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
let servers = require('./servers.json');
const cCheckAutoModeInterval = 60 // In Sec
const cWakingInterval = 30 // In Sec
let WakingServersArray = []
const Debugging = true

// Functions //
// Ping Function
async function checkServerStatus(ip) {
  try {
    const result = await ping.promise.probe(ip, { timeout: 5 });
    return result.alive

  } catch (error) {
    console.warn("Error while pinging ", ip)
    return false
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// API Functions //
// API to get servers
app.get('/api/servers', async (req, res) => {
  if (Debugging) {console.log("DEBUG: API CALL: GET /api/servers")}
  const serversWithoutStatus = servers.map(server => {
    return { ...server };
  });
  res.json(serversWithoutStatus);
});

// API to add a new server
app.post('/api/servers', (req, res) => {
  const { name, ip, mac, autoMode } = req.body;
  if (Debugging) {console.log("DEBUG: API CALL: POST /api/servers with data", name, " | ", ip, " | ", mac, " | ", autoMode, " | ", )}
  servers.push({ name, ip, mac, autoMode });
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.status(201).send('Server added');
});

// API to manually send WOL packet
app.post('/api/wake/:index', (req, res) => {
  const server = servers[req.params.index];
  if (Debugging) {console.log("DEBUG: API CALL: POST /api/wake with data", server)}
  wol.wake(server.mac, (err) => {
    if (err) {
      if (Debugging) {console.log("DEBUG: API CALL: /api/wake ERROR: ")}
      console.error(err)
      res.status(500).send('Failed to send WOL packet');
    } else {
      if (Debugging) {console.log("DEBUG: API CALL: /api/wake sent Magic Packet!")}
      res.send('Wake packet sent');
    }
  });
});

// API to toggle auto mode
app.post('/api/toggle/:index', (req, res) => {
  if (Debugging) {console.log("DEBUG: API CALL: POST /api/toggle with data", index)}
  servers[req.params.index].autoMode = !servers[req.params.index].autoMode;
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.send('Auto mode toggled');
});

// API to remove a server
app.delete('/api/servers/:index', (req, res) => {
  const index = req.params.index;
  if (Debugging) {console.log("DEBUG: API CALL: DELETE /api/servers with data", index)}
  if (index < 0 || index >= servers.length) {
    return res.status(400).send('Invalid index');
  }
  servers.splice(index, 1);
  fs.writeFileSync('./servers.json', JSON.stringify(servers, null, 2));
  res.send('Server removed');
});

// API to get statuses of servers (Single and all)
app.get('/api/status/:index?', async (req, res) => {
  const { index } = req.params;
  if (Debugging) {console.log("DEBUG: API CALL: GET /api/status with data", index)}

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


// WOL Functions //
// Send WOL packet to wake server
async function attemptWake(server, retries) {
  while (retries > 0) {
    resultPing = await ping.promise.probe(server.ip, { timeout: 5 });

    if (resultPing.alive) {
      break
    } else {
      wol.wake(server.mac, (err) => {
        if (err) {
          console.warn(`Failed to wake ${server.name}:`, err);
        } else {
          console.log("Wake packet sent to Server ", server.name, " (", server.ip, ") Trys left: ", retries);
        }
      });
    }
    
    await sleep(cWakingInterval);
    retries -= 1;
  }
  return 0;
}

// Handle wake attempts
async function checkAndWake(server, index) {
  try {
    let resultPing = await ping.promise.probe(server.ip, { timeout: 5 });
    if (Debugging) {console.log("DEBUG: Checking if ", server.name, " (", server.ip, ") is alive: ", resultPing.alive)}
    if (!resultPing.alive) {
      console.log("Server ", server.name, " (",server.ip,") is down. Attempting to wake up...")
      const resultWake = await attemptWake(server, 3)
      resultPing = await ping.promise.probe(server.ip, { timeout: 5 });

      if (resultWake == 0) {
        if (!resultPing.alive) {
          console.log("Server ",server.name, " (",server.ip,") is down! Failed to Wake!")
        } else {
          console.log("Server ",server.name, " (",server.ip,") is up!")
        }
        // Remove server.ip from Array
        let indexArray = WakingServersArray.indexOf(server.ip);
        if (indexArray !== -1) {
          WakingServersArray.splice(indexArray, 1);
        }
      }
    } else {
      // If server.ip alive, remove from Array
      let indexArray = WakingServersArray.indexOf(server.ip);
      if (indexArray !== -1) {
        WakingServersArray.splice(indexArray, 1);
      }
    }
  } catch (error) {
    console.log("Server ",server.name, " (", server.ip, ") is down! Error!")
    console.error(err)
  }
}

// INIT //
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
if (Debugging) {console.log("DEBUG: Debugging is Enabled!")}

// AutoMode Loop
setInterval(() => {
  servers.forEach((server, index) => {
    if (server.autoMode) {
      // If server.ip is not found in array
      if (WakingServersArray.indexOf(server.ip) == -1) {
        WakingServersArray.push(server.ip)
        checkAndWake(server, index);
      }
    }
  });
}, cCheckAutoModeInterval * 1000);

// Start frontend
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
