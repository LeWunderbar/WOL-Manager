#!/bin/bash

# VARS
TOKEN=$1
INSTALL_DIR="/opt/shutdown-server"
SERVICE_NAME="shutdown-server"
REPO="https://raw.githubusercontent.com/LeWunderbar/WOL-Manager/shutdown-option/shutdown-files/shutdown-client.js"

# Check if a token is provided
if [ -z "$TOKEN" ]; then
  echo "Error: No token provided. Usage: $0 your-token-here"
  exit 1
fi

# Install Node.js
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
cd $INSTALL_DIR

# Get file from github
echo "Downloading shutdown-client.js from GitHub..."
sudo curl -o shutdownServer.js $REPO

# Write the config file
sudo bash -c "cat > config.json <<EOL
{
  \"token\": \"$TOKEN\"
}
EOL"

# Install npm dependencies
npm init -y > /dev/null 2>&1
npm install express child_process > /dev/null 2>&1

# Stop and disable the existing service if it exists
if systemctl is-active --quiet $SERVICE_NAME; then
  echo "Stopping the existing service..."
  sudo systemctl stop $SERVICE_NAME
fi

if systemctl is-enabled --quiet $SERVICE_NAME; then
  echo "Disabling the existing service..."
  sudo systemctl disable $SERVICE_NAME
fi

# Remove the existing systemd service file if it exists
if [ -f /etc/systemd/system/$SERVICE_NAME.service ]; then
  echo "Removing the existing systemd service..."
  sudo rm /etc/systemd/system/$SERVICE_NAME.service
fi

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