#!/usr/bin/env bash
set -euo pipefail
echo "Installing global npm tools"
pnpm add -g nx@latest
echo "Creating Kind cluster 'dev'"
minikube start -p dev
echo "Everything looks good 🚀"
