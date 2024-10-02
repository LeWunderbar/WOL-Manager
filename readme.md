# WOL-Manager

## What is WOL-Manager?

WOL-Manager is a Node.js application that allows you to manage and monitor your servers using Wake-On-LAN (WOL) functionality. With WOL-Manager, you can easily wake up servers that are powered off, check their status, and automate the wake-up process based on server availability.

### Automode

Automode is a feature that automatically checks the status of your servers at regular intervals. If a server is found to be offline, WOL-Manager will attempt to wake it up using the Wake-On-LAN protocol. You can enable or disable this feature for each server individually, providing you with flexibility in managing your server environment.

## How to Access the Web GUI

To access the WOL-Manager web GUI, follow these steps:

1. Ensure that the application is running on your server.
2. Open a web browser and navigate to `http://<your-server-ip>:3000`, replacing `<your-server-ip>` with the IP address of the machine running WOL-Manager.
3. You should see the WOL-Manager interface, where you can manage your servers.

## How to Use the Web GUI

Once you have accessed the web GUI, you can perform the following actions:

1. **View Servers**: The main dashboard displays a list of all configured servers along with their status (online or offline).
2. **Add a New Server**: Click the "Add Server" button, fill in the required information (name, IP address, MAC address, and whether to enable automode), and submit the form. The new server will be added to your list.
3. **Wake a Server**: If a server is offline, you can manually wake it by clicking the "Wake" button next to the server's entry. A notification will confirm whether the wake packet was successfully sent.
4. **Toggle Automode**: To enable or disable the automode feature for a specific server, click the "Toggle" button next to the server. A notification will confirm the change.
5. **Remove a Server**: To remove a server from the list, click the "Remove" button next to the server. A confirmation notification will inform you of the successful removal.
6. **Check Server Status**: The status of each server is displayed in real-time. You can also check the status by clicking the "Check Status" button next to the server.

## How to Use the API

WOL-Manager also provides a RESTful API to interact with the application programmatically. Below are the available API endpoints:

### Get Servers

- **Endpoint**: `GET /api/servers`
- **Description**: Retrieve a list of all configured servers.
- **Response**: Returns a JSON array of server objects.

### Add a New Server

- **Endpoint**: `POST /api/servers`
- **Request Body**:
  ```json
  {
    "name": "Server Name",
    "ip": "192.168.1.1",
    "mac": "00:1A:2B:3C:4D:5E",
    "autoMode": true
  }
