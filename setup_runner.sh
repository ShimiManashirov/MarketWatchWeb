#!/bin/bash

# Capability Checks
echo "--- Checking Server Capabilities ---"
for cmd in docker git node npm; do
    if command -v $cmd &> /dev/null; then
        echo "✅ $cmd is installed: $($cmd --version | head -n 1)"
    else
        echo "❌ $cmd is NOT installed!"
    fi
done
echo "------------------------------------"

# Configuration
# MarketWatchWeb - Self-Hosted Runner Setup Script
# Run this on the node65 server

# 1. Create a folder
mkdir -p actions-runner && cd actions-runner

# 2. Download the latest runner package
curl -o actions-runner-linux-x64-2.332.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.332.0/actions-runner-linux-x64-2.332.0.tar.gz

# 3. Extract the installer
tar xzf ./actions-runner-linux-x64-2.332.0.tar.gz

# 4. Configure the runner
echo "--------------------------------------------------------"
echo "Go to Settings -> Actions -> Runners -> New self-hosted runner"
echo "Copy the --token value and paste it when prompted below."
echo "--------------------------------------------------------"

# Run config.sh
./config.sh || { echo "❌ Configuration failed! Cleaning up..."; exit 1; }

# 5. Install as a service so it runs in the background
sudo ./svc.sh install
sudo ./svc.sh start

echo "✅ Runner is now installed and started as a service!"
