FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 pkg-config libx11-dev libxext-dev libxss-dev \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global --force yarn@1.22.22
USER node