# WOL-Manager

## What is WOL-Manager?

WOL-Manager is a Node.js application that allows you to manage and monitor your servers using Wake-On-LAN (WOL) functionality. With WOL-Manager, you can easily wake up servers that are powered off, check their status, and automate the wake-up process based on server availability.

### Automode

Automode is a feature that automatically checks the status of your servers at regular intervals. If a server is found to be offline, WOL-Manager will attempt to wake it up using the Wake-On-LAN protocol. You can enable or disable this feature for each server individually, providing you with flexibility in managing your server environment.

### Shutdown Option

By selecting this option, the user can install a script on the target server to enable shutdown control and monitoring. Please be aware that the script uses unsecured HTTP, and API tokens are stored in plain text. Proceed with caution as this may pose security risks.

## How to Access the Web GUI

To access the WOL-Manager web GUI, follow these steps:

1. Ensure that the application is running on your server.
2. Open a web browser and navigate to `http://localhost:3000`
3. You should see the WOL-Manager interface, where you can manage your servers.

## How to Use the Web GUI

Once you have accessed the web GUI, you can perform the following actions:

2. **Add a New Server**: Enter Nickname, IP Address and MAC Address of your network interface, and click add to add an new server.

3. **Wake a Server**: If a server is offline, you can manually wake it by clicking the "Wake" button next to the server"s entry

4. **Toggle Automode**: To enable or disable the automode feature for a specific serve

5. **Remove a Server**: To remove a server from the list, click the "Remove" button next to the server.