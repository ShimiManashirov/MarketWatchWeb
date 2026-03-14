#!/bin/bash

# MarketWatchWeb - Self-Hosted Runner Setup Script
# Run this on the node65 server

# 1. Create a folder
mkdir -p actions-runner && cd actions-runner

# 2. Download the latest runner package
curl -o actions-runner-linux-x64-2.314.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.314.1/actions-runner-linux-x64-2.314.1.tar.gz

# 3. Extract the installer
tar xzf ./actions-runner-linux-x64-2.314.1.tar.gz

# 4. Configure the runner (User will need to provide the token from GitHub UI)
echo "--------------------------------------------------------"
echo "Go to Settings -> Actions -> Runners -> New self-hosted runner"
echo "Copy the --token value and paste it when prompted below."
echo "--------------------------------------------------------"

./config.sh

# 5. Install as a service so it runs in the background
sudo ./svc.sh install
sudo ./svc.sh start

echo "Runner is now installed and started as a service!"
