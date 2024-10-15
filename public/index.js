// WOL-MANAGER | frontend | index.js

// VARS //
const cStatusUpdateInterval = 5 // In Sec

// FUNCTIONS //
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
	  <button class="wake_btn button" onclick="wakeServer(${index})">Wake</button>
	  ${server.allowShutdown ? `<button class="shutdown_btn button" onclick="shutdownServer(${index})">Shutdown</button>` : ''}
	  <button class="remove_btn button" onclick="removeServer(${index})">Remove</button>
	`;
	serverList.appendChild(serverDiv);
  });
}

// Get and update Statuses of servers
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

// API FUNCTIONS //

// shutdown API Call
async function shutdownServer(index) {
	try {
	  const response = await fetch(`/api/shutdown/${index}`, { method: 'POST' });
	  if (!response.ok) {
		showNotification('Failed to send shutdown request.', 'error');
	  }
	  showNotification('Shutdown request successfully send.', 'success');
	} catch (error) {
	  showNotification('Failed to send shutdown request.', 'error');
	}
}

// WakeServer API Call
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

// Toggle Automode API Call
async function toggleAutoMode(index) {
  try {
	const response = await fetch(`/api/toggle/${index}`, { method: 'POST' });
	if (!response.ok) {
	  showNotification('Failed to toggle Automode.', 'error');
	}
	showNotification('Changed Automode successfully.', 'success');

	fetchServers();
  } catch (error) {
	showNotification('Failed to toggle Automode.', 'error');
  }
}

// Remove server API Call
async function removeServer(index) {
  try {
	const response = await fetch(`/api/servers/${index}`, { method: 'DELETE' });
	if (!response.ok) {
	  showNotification('Failed to remove server.', 'error');
	}

	fetchServers();
	showNotification('Server removed successfully.', 'success');
  } catch (error) {
	showNotification('Failed to remove server.', 'error');
  }
}

// Add New server Handler and API Call
document.getElementById('new-server-form').addEventListener('submit', async (e) => {
  try {
	e.preventDefault();
	const name = document.getElementById('name').value;
	const ip = document.getElementById('ip').value;
	const mac = document.getElementById('mac').value;
	const autoMode = document.getElementById('autoMode').checked;
	const allowShutdown = document.getElementById("allowShutdown").checked;

	await fetch('/api/servers', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ name, ip, mac, autoMode, allowShutdown })
	});

	// Clear input fields after adding the server
	document.getElementById('name').value = '';
	document.getElementById('ip').value = '';
	document.getElementById('mac').value = '';
	document.getElementById('autoMode').checked = false;
	document.getElementById("allowShutdown").checked = false

	fetchServers();
	updateServerStatuses();
	showNotification('Server added successfully.', 'success');
  } catch (error) {
	showNotification('Failed to remove server.', 'error');
  }
});

// INIT //
fetchServers();
updateServerStatuses();

// Update Statuses Loop
setInterval(() => {
  updateServerStatuses();
}, cStatusUpdateInterval * 1000);
