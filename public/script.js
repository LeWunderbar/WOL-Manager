async function fetchServers() {
    const response = await fetch('/api/servers');
    const servers = await response.json();
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = '';
    servers.forEach((server, index) => {
      const serverDiv = document.createElement('div');
      serverDiv.innerHTML = `
        <h4>${server.name} (${server.ip})</h4>
        <button onclick="wakeServer(${index})">Wake</button>
        <label>
          Auto Mode:
          <input type="checkbox" ${server.autoMode ? 'checked' : ''} onchange="toggleAutoMode(${index})">
        </label>
      `;
      serverList.appendChild(serverDiv);
    });
  }
  
  async function wakeServer(index) {
    await fetch(`/api/wake/${index}`, { method: 'POST' });
    alert('Wake packet sent');
  }
  
  async function toggleAutoMode(index) {
    await fetch(`/api/toggle/${index}`, { method: 'POST' });
    fetchServers();
  }
  
  document.getElementById('new-server-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const ip = document.getElementById('ip').value;
    const mac = document.getElementById('mac').value;
    const autoMode = document.getElementById('autoMode').checked;
    await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ip, mac, autoMode })
    });
    fetchServers();
  });
  
  fetchServers();