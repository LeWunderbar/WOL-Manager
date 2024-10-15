#!/bin/bash

# Default values for variables
TOKEN=$1
INSTALL_DIR="/opt/shutdown-server"
SERVICE_NAME="shutdown-server"

# Install Node.js (skip if already installed)
if ! command -v node > /dev/null; then
  echo "Node.js not found. Installing the latest Node.js version..."
  curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "Node.js found. Checking version..."
  CURRENT_NODE_VERSION=$(node -v)
  echo "Current Node.js version: $CURRENT_NODE_VERSION"
fi

# Create installation directory
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# Move to installation directory
cd $INSTALL_DIR

# Fetch the shutdown client code from GitHub
echo "Downloading shutdown-client.js from GitHub..."
curl -o shutdownServer.js https://raw.githubusercontent.com/LeWunderbar/WOL-Manager/main/shutdown-files/shutdown-client.js

# Write the config file with the token
cat > config.json <<EOL
{
  "token": "$TOKEN"
}
EOL

# Install npm dependencies
npm init -y > /dev/null 2>&1
npm install express child_process > /dev/null 2>&1

# Setup systemd service
echo "Setting up systemd service..."

sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOL
[Unit]
Description=Shutdown Server API
After=network.target

[Service]
ExecStart=/usr/bin/node $INSTALL_DIR/shutdownServer.js
Restart=always
User=$USER
Group=$USER
Environment=PATH=/usr/bin:/usr/local/bin
WorkingDirectory=$INSTALL_DIR

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo "Shutdown server installed and started!"