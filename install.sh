#!/bin/bash

# Configuration
REPO_URL="https://github.com/hamidmayeli/outline-config-server"  # Replace with your GitHub repository URL
DEST_FILE="docker-compose.yml"

# Print commands and exit on errors
set -xe

# Download docker-compose.yml
curl -L "${REPO_URL}/raw/main/${DEST_FILE}" -o "${DEST_FILE}"

# Ensure Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose could not be found, installing..."
    # On Linux
    sudo apt-get update
    sudo apt-get install -y docker-compose
fi

# Run Docker Compose
docker compose up -d
