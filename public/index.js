// Fetch servers and display them
async function fetchServers() {
  const response = await fetch('/api/servers');
  const servers = await response.json();
  const serverList = document.getElementById('server-list');
  serverList.innerHTML = '';
  
  servers.forEach((server, index) => {
    const serverDiv = document.createElement('div');
    const dotColor = server.isOnline ? '#1db954' : '#9c0d0d'; // Determine dot color based on server status
    const dotStyle = `width: 10px; height: 10px; border-radius: 50%; background-color: ${dotColor}; display: inline-block; margin-right: 10px; vertical-align: middle;`;
    
    serverDiv.innerHTML = `
      <h3>
        <span style="${dotStyle}"></span>${server.name} (${server.ip})
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
      throw new Error('Failed to send wake packet.');
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
    showNotification('Server removed successfully.', 'success');
    fetchServers();
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

// Fetch the list of servers when the page loads
fetchServers();
