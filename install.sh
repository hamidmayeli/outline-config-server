#!/bin/bash

CURRENT_PATH=$(pwd)

# Function to display usage
usage() {
    echo "Usage: $0 [--host <domain>] [--email <email>]"
    exit 1
}

# Default domain
DOMAIN=ui.etemadify.com
EMAIL=rand@dom.com

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --host) 
            if [[ -n "$2" && ! "$2" =~ ^- ]]; then
                DOMAIN="$2"
                shift
            else
                echo "Error: --host requires a non-empty argument."
                usage
            fi
            ;;
        --email) 
            if [[ -n "$2" && ! "$2" =~ ^- ]]; then
                EMAIL="$2"
                shift
            else
                echo "Error: --email requires a non-empty argument."
                usage
            fi
            ;;
        *) 
            echo "Unknown parameter passed: $1"
            usage
            ;;
    esac
    shift
done

# Output parsed values
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

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

# Get certificate
docker run -d -v ./data/webroot:/usr/share/nginx/html -p 80:80 --name nginx nginx

docker run --name certbot --rm \
    -v ./data/webroot:/home/webroot \
    -v ./data/ssl:/data/ssl \
    --entrypoint /bin/sh \
    certbot/certbot -c "certbot certonly --webroot -w /home/webroot -d ${DOMAIN} --agree-tos -m ${EMAIL} -n --cert-name my-ssl && cat /etc/letsencrypt/live/my-ssl/fullchain.pem > /data/ssl/the.pem && cat /etc/letsencrypt/live/my-ssl/privkey.pem > /data/ssl/the.key"

docker rm -f nginx

# Create a .env file for Docker Compose
echo "DOMAIN=${DOMAIN}" > .env

# Run Docker Compose
docker compose up -d

# Create renew certs
echo "#!/bin/bash

# Change to the directory where your docker-compose.yml is located
cd ${CURRENT_PATH}

docker compose down

docker run -d -v ./ data/webroot:/usr/share/nginx/html -p 80:80 --name nginx nginx

docker run --name certbot-renew -it --rm \
  -v ./data/webroot:/home/webroot \
  -v ./data/ssl:/data/ssl \
  --entrypoint /bin/sh \
  certbot/certbot -c \"certbot renew --webroot -w /home/webroot --cert-name my-ssl && cat /etc/letsencrypt/live/my-ssl/fullchain.pem > /data/ssl/the.pem && cat /etc/letsencrypt/live/my-ssl/privkey.pem > /data/ssl/the.key\"

docker rm -f nginx
docker compose up -d
" > /tmp/renew-certs.sh

chmod +x /tmp/renew-certs.sh

echo "0 2 1 1,3,5,7,9,11 * /tmp/renew-certs.sh" > /tmp/crontab.job

# Create update.sh
echo "#!/bin/bash

# Change to the directory where your docker-compose.yml is located
cd ${CURRENT_PATH}

# Pull the latest version of the Docker image
docker compose pull

# Recreate containers with the new image (if there's an update) and remove old containers
docker compose up -d --remove-orphans

# Optionally, remove unused images to free up space
docker image prune -f
" > /tmp/update.sh

chmod +x /tmp/update.sh

echo "0 2 * * * /tmp/update.sh" >> /tmp/crontab.job

crontab /tmp/crontab.job
