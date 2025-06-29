#!/bin/bash

# Create necessary directories
mkdir -p volumes/postgres

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the development environment
echo "Starting development environment..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e "\nPostgreSQL is ready!"

# Set up environment variables if they don't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/launchpad" > .env
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

echo "Development environment is ready! 🚀"
echo "You can now run 'pnpm dev' to start the development servers" 