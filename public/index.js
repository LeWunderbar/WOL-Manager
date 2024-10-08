// Fetch servers and display them
async function fetchServers() {
  const response = await fetch('/api/servers');
  const servers = await response.json();
  const serverList = document.getElementById('server-list');
  serverList.innerHTML = '';

  servers.forEach((server, index) => {
    const serverDiv = document.createElement('div');
    const dotStyle = `width: 10px; height: 10px; border-radius: 50%; background-color: #9c0d0d; display: inline-block; margin-right: 10px; vertical-align: middle;`; // default dot color (offline)

    serverDiv.innerHTML = `
      <h3>
        <span id="status-dot-${index}" style="${dotStyle}"></span>${server.name} (${server.ip})
      </h3>
      <label>
      <input type="checkbox" ${server.autoMode ? 'checked' : ''} onchange="toggleAutoMode(${index})">
      Auto Mode
      </label>
      <button class="wake_btn" onclick="wakeServer(${index})">Wake</button>
      <button class="remove_btn" onclick="removeServer(${index})">Remove</button>
    `;
    serverList.appendChild(serverDiv);
  });

  // Fetch and update server statuses after rendering
  updateServerStatuses();
}

async function updateServerStatuses() {
  try {
    const response = await fetch('/api/status');
    const servers = await response.json();

    servers.forEach((server, index) => {
      const dot = document.getElementById(`status-dot-${index}`);
      const dotColor = server.isOnline ? '#1db954' : '#9c0d0d'; // online is green, offline is red
      dot.style.backgroundColor = dotColor;
    });
  } catch (error) {
    console.error('Failed to fetch server statuses:', error);
  }
}


// Notification Handler
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.className = `notification ${type}`;
  notification.innerText = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
      notification.style.opacity = '1'; 
    }, 500); 
  }, 3000); 
}

async function wakeServer(index) {
  try {
    const response = await fetch(`/api/wake/${index}`, { method: 'POST' });
    if (!response.ok) {
      showNotification('Failed to send wake packet.', 'error');
    }
    showNotification('Wake packet sent successfully.', 'success');
  } catch (error) {
    showNotification('Failed to send wake packet.', 'error');
  }
}

async function removeServer(index) {
  try {
    const response = await fetch(`/api/servers/${index}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to remove server.');
    }

    fetchServers();
    showNotification('Server removed successfully.', 'success');
  } catch (error) {
    showNotification('Failed to remove server.', 'error');
  }
}

// Add server Handler
document.getElementById('new-server-form').addEventListener('submit', async (e) => {
  try {
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

    // Clear input fields after adding the server
    document.getElementById('name').value = '';
    document.getElementById('ip').value = '';
    document.getElementById('mac').value = '';
    document.getElementById('autoMode').checked = false;

    fetchServers();
    showNotification('Server added successfully.', 'success');
  } catch (error) {
    showNotification('Failed to remove server.', 'error');
  }
});

setInterval(() => {
  fetchServers();
}, 5000);
