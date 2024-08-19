#!/bin/bash

CURRENT_PATH=$0

# Function to display usage
usage() {
    echo "Usage: $0 [--host <domain>]"
    exit 1
}

# Default domain
DOMAIN=

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --host) DOMAIN="$2"; shift ;;
        *) usage ;;
    esac
    shift
done

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

# Create a .env file for Docker Compose
echo "DOMAIN=${DOMAIN}" > .env

# Run Docker Compose
docker compose up -d

echo "#!/bin/bash

# Change to the directory where your docker-compose.yml is located
cd ${CURRENT_PATH}

# Pull the latest version of the Docker image
docker-compose pull

# Recreate containers with the new image (if there's an update) and remove old containers
docker-compose up -d --remove-orphans

# Optionally, remove unused images to free up space
docker image prune -f
" > /tmp/update.sh

chmod +x /tmp/update.sh

echo "0 2 * * * /tmp/update.sh" > /tmp/crontab.job

crontab /tmp/crontab.job
