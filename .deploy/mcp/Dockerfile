# Silo MCP

# Transport settings
ARG MCP_TRANSPORT
ARG MCP_SERVER_MODE

# Server configuration
ARG MCP_HTTP_PORT
ARG MCP_HTTP_HOST

# Security settings
ARG MCP_CORS_ORIGIN
ARG MCP_CORS_CREDENTIALS

# AUTH
ARG MCP_AUTH_ENABLED
ARG MCP_AUTH_RESOURCE_URI
ARG MCP_AUTH_REQUIRED_SCOPES
ARG MCP_AUTH_SERVERS

# JWT
ARG MCP_AUTH_JWT_AUDIENCE
ARG MCP_AUTH_JWT_ISSUER
ARG MCP_AUTH_JWT_ALGORITHMS
ARG MCP_AUTH_JWT_JWKS_URI
ARG MCP_AUTH_JWT_PUBLIC_KEY

# Token Introspection (Alternative to JWT validation)
ARG MCP_AUTH_INTROSPECTION_ENDPOINT
ARG MCP_AUTH_INTROSPECTION_CLIENT_ID
ARG MCP_AUTH_INTROSPECTION_CLIENT_SECRET

# OAuth caching and performance
ARG MCP_AUTH_TOKEN_CACHE_TTL
ARG MCP_AUTH_METADATA_CACHE_TTL

# OAuth server options
ARG MCP_AUTH_ALLOW_EMBEDDED_SERVER
ARG MCP_AUTH_SESSION_SECRET

# Session management (stored in Redis)
ARG MCP_SESSION_ENABLED
ARG MCP_SESSION_COOKIE_NAME
ARG MCP_SESSION_TTL
ARG REDIS_ENABLED
ARG REDIS_URL
ARG REDIS_HOST
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG REDIS_USER
ARG REDIS_TLS

# Rate limiting and security
ARG THROTTLE_ENABLED
ARG THROTTLE_TTL
ARG THROTTLE_LIMIT
ARG MCP_TRUSTED_PROXIES

# API settings (defaults updated for Silo)
ARG API_BASE_URL
ARG GAUZY_AUTH_EMAIL
ARG GAUZY_AUTH_PASSWORD
ARG GAUZY_AUTO_LOGIN

# Server configuration
ARG MCP_WS_PORT
ARG MCP_WS_HOST
ARG MCP_WS_PATH

# TLS/SSL settings (recommended for production)
ARG MCP_WS_TLS
ARG MCP_WS_KEY_PATH
ARG MCP_WS_CERT_PATH

# WebSocket features
ARG MCP_WS_COMPRESSION
ARG MCP_WS_PER_MESSAGE_DEFLATE
ARG MCP_WS_MAX_PAYLOAD

# Security settings
ARG MCP_WS_ALLOWED_ORIGINS
ARG MCP_WS_SESSION_ENABLED
ARG MCP_WS_SESSION_COOKIE_NAME
ARG MCP_WS_TRUSTED_PROXIES
ARG NX_CLOUD_ACCESS_TOKEN
ARG NX_BRANCH

FROM node:24.16.0-alpine3.23 AS dependencies

LABEL maintainer="support@silo.local"
LABEL org.opencontainers.image.source="https://github.com/welpgrinch/Silo-Business-Suite"

RUN apk add --no-cache python3 python3-dev py3-pip py3-setuptools build-base gcc g++ make autoconf automake git \
    && npm install --quiet node-gyp@10.2.0 -g \
    && npm install yarn -g --force \
    && npm install --quiet ts-node@10.9.2 -g

RUN mkdir /srv/silo-mcp && chown -R node:node /srv/silo-mcp

USER node:node

WORKDIR /srv/silo-mcp

COPY --chown=node:node apps/mcp/package.json ./apps/mcp/
COPY --chown=node:node packages/mcp-server/package.json ./packages/mcp-server/
COPY --chown=node:node packages/auth/package.json ./packages/auth/
COPY --chown=node:node packages/common/package.json ./packages/common/
COPY --chown=node:node packages/config/package.json ./packages/config/
COPY --chown=node:node packages/constants/package.json ./packages/constants/
COPY --chown=node:node packages/contracts/package.json ./packages/contracts/
COPY --chown=node:node packages/utils/package.json ./packages/utils/
COPY --chown=node:node lerna.json package.json yarn.lock ./
COPY --chown=node:node .scripts/postinstall.js ./.scripts/

ARG VERDACCIO_REGISTRY=""
RUN --mount=type=secret,id=VERDACCIO_TOKEN,uid=1000 \
    VERDACCIO_TOKEN="$(cat /run/secrets/VERDACCIO_TOKEN 2>/dev/null || true)" && \
    if [ -n "$VERDACCIO_REGISTRY" ] && wget -q -T 5 -O /dev/null "${VERDACCIO_REGISTRY%/}/-/ping"; then \
    echo "registry=${VERDACCIO_REGISTRY}" >> .npmrc && \
    echo "registry \"${VERDACCIO_REGISTRY}\"" >> .yarnrc && \
    sed -i "s|https://registry.yarnpkg.com|${VERDACCIO_REGISTRY%/}|g" yarn.lock && \
    sed -i "s|https://registry.npmjs.org|${VERDACCIO_REGISTRY%/}|g" yarn.lock; \
    elif [ -n "$VERDACCIO_TOKEN" ]; then \
    echo "//packages.ever.co/:_authToken=${VERDACCIO_TOKEN}" >> .npmrc && \
    echo "registry=https://packages.ever.co/" >> .npmrc && \
    echo "always-auth=true" >> .npmrc && \
    echo 'registry "https://packages.ever.co/"' >> .yarnrc && \
    sed -i 's|https://registry.yarnpkg.com|https://packages.ever.co|g' yarn.lock && \
    sed -i 's|https://registry.npmjs.org|https://packages.ever.co|g' yarn.lock; \
    fi && \
    yarn install --network-timeout 1000000 --network-concurrency 4 --frozen-lockfile --ignore-scripts && \
    yarn postinstall.manual && \
    yarn cache clean && \
    rm -f .npmrc .yarnrc

COPY --chown=node:node apps/mcp ./apps/mcp
COPY --chown=node:node packages/mcp-server ./packages/mcp-server/
COPY --chown=node:node packages/auth ./packages/auth/
COPY --chown=node:node packages/common ./packages/common/
COPY --chown=node:node packages/config ./packages/config/
COPY --chown=node:node packages/constants ./packages/constants/
COPY --chown=node:node packages/contracts ./packages/contracts/
COPY --chown=node:node packages/utils ./packages/utils/

FROM dependencies AS build

WORKDIR /srv/silo-mcp

COPY --chown=node:node tsconfig.base.json tsconfig.json ./
COPY --chown=node:node nx.json lerna.json ./

ARG NODE_OPTIONS
ARG NX_CLOUD_ACCESS_TOKEN
ARG NX_BRANCH

ENV NX_NO_CLOUD=true
ENV NX_CLOUD_ACCESS_TOKEN=${NX_CLOUD_ACCESS_TOKEN}
ENV NX_BRANCH=${NX_BRANCH}
ENV CI=true

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=30000"}
ENV NODE_ENV=production
ENV IS_DOCKER=true

RUN rm -rf /srv/silo-mcp/dist

RUN yarn build:mcp:prod

FROM node:24.16.0-alpine3.23 AS proddependencies

RUN apk add --no-cache python3 python3-dev py3-pip py3-setuptools build-base gcc g++ make autoconf automake git \
    && npm install --quiet node-gyp@10.2.0 -g \
    && npm install yarn -g --force \
    && npm install --quiet ts-node@10.9.2 -g

RUN mkdir -p /srv/silo-mcp && chown node:node /srv/silo-mcp

USER node:node

WORKDIR /srv/silo-mcp

COPY --chown=node:node --from=build /srv/silo-mcp/dist .

RUN ln -s . dist

COPY --chown=node:node lerna.json package.json yarn.lock ./
COPY --chown=node:node .scripts/postinstall.js ./.scripts/

ARG VERDACCIO_REGISTRY=""
RUN --mount=type=secret,id=VERDACCIO_TOKEN,uid=1000 \
    VERDACCIO_TOKEN="$(cat /run/secrets/VERDACCIO_TOKEN 2>/dev/null || true)" && \
    if [ -n "$VERDACCIO_REGISTRY" ] && wget -q -T 5 -O /dev/null "${VERDACCIO_REGISTRY%/}/-/ping"; then \
    echo "registry=${VERDACCIO_REGISTRY}" >> .npmrc && \
    echo "registry \"${VERDACCIO_REGISTRY}\"" >> .yarnrc && \
    sed -i "s|https://registry.yarnpkg.com|${VERDACCIO_REGISTRY%/}|g" yarn.lock && \
    sed -i "s|https://registry.npmjs.org|${VERDACCIO_REGISTRY%/}|g" yarn.lock; \
    elif [ -n "$VERDACCIO_TOKEN" ]; then \
    echo "//packages.ever.co/:_authToken=${VERDACCIO_TOKEN}" >> .npmrc && \
    echo "registry=https://packages.ever.co/" >> .npmrc && \
    echo "always-auth=true" >> .npmrc && \
    echo 'registry "https://packages.ever.co/"' >> .yarnrc && \
    sed -i 's|https://registry.yarnpkg.com|https://packages.ever.co|g' yarn.lock && \
    sed -i 's|https://registry.npmjs.org|https://packages.ever.co|g' yarn.lock; \
    fi && \
    yarn install --network-timeout 1000000 --network-concurrency 4 --frozen-lockfile --ignore-scripts --production && \
    yarn postinstall.manual && \
    yarn cache clean && \
    rm -f .npmrc .yarnrc

FROM proddependencies AS production

WORKDIR /srv/silo-mcp

RUN yarn cache clean

ENV MCP_TRANSPORT=${MCP_TRANSPORT:-http}
ENV MCP_SERVER_MODE=${MCP_SERVER_MODE:-http}

ENV MCP_HTTP_PORT=${MCP_HTTP_PORT:-3001}
ENV MCP_HTTP_HOST=${MCP_HTTP_HOST:-localhost}

ENV MCP_CORS_ORIGIN=${MCP_CORS_ORIGIN:-http://localhost:3000,http://localhost:4200}
ENV MCP_CORS_CREDENTIALS=${MCP_CORS_CREDENTIALS:-true}

ENV MCP_AUTH_ENABLED=${MCP_AUTH_ENABLED:-true}
ENV MCP_AUTH_RESOURCE_URI=${MCP_AUTH_RESOURCE_URI:-https://mcpdemo.silo.local}
ENV MCP_AUTH_REQUIRED_SCOPES=${MCP_AUTH_REQUIRED_SCOPES:-mcp.read,mcp.write}
ENV MCP_AUTH_SERVERS=${MCP_AUTH_SERVERS:-"[]"}

ENV MCP_AUTH_JWT_AUDIENCE=${MCP_AUTH_JWT_AUDIENCE:-https://mcp.silo.local}
ENV MCP_AUTH_JWT_ISSUER=${MCP_AUTH_JWT_ISSUER:-https://auth.silo.local}
ENV MCP_AUTH_JWT_ALGORITHMS=${MCP_AUTH_JWT_ALGORITHMS:-RS256,ES256}
ENV MCP_AUTH_JWT_JWKS_URI=${MCP_AUTH_JWT_JWKS_URI:-https://auth.silo.local/.well-known/jwks.json}
ENV MCP_AUTH_JWT_PUBLIC_KEY=${MCP_AUTH_JWT_PUBLIC_KEY}

ENV MCP_AUTH_INTROSPECTION_ENDPOINT=${MCP_AUTH_INTROSPECTION_ENDPOINT:-https://auth.silo.local/token/introspect}
ENV MCP_AUTH_INTROSPECTION_CLIENT_ID=${MCP_AUTH_INTROSPECTION_CLIENT_ID}
ENV MCP_AUTH_INTROSPECTION_CLIENT_SECRET=${MCP_AUTH_INTROSPECTION_CLIENT_SECRET}

ENV MCP_AUTH_METADATA_CACHE_TTL=${MCP_AUTH_METADATA_CACHE_TTL:-3600}

ENV MCP_AUTH_ALLOW_EMBEDDED_SERVER=${MCP_AUTH_ALLOW_EMBEDDED_SERVER:-true}
ENV MCP_AUTH_SESSION_SECRET=${MCP_AUTH_SESSION_SECRET}

ENV MCP_SESSION_ENABLED=${MCP_SESSION_ENABLED:-true}
ENV MCP_SESSION_COOKIE_NAME=${MCP_SESSION_COOKIE_NAME:-mcp-session-id}
ENV MCP_SESSION_TTL=${MCP_SESSION_TTL:-1800000}
ENV REDIS_ENABLED=${REDIS_ENABLED:-true}
ENV REDIS_URL=${REDIS_URL:-redis://localhost:6379}
ENV REDIS_HOST=${REDIS_HOST:-localhost}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV REDIS_PORT=${REDIS_PORT:-6379}
ENV REDIS_USER=${REDIS_USER:-default}
ENV REDIS_TLS=${REDIS_TLS:-false}

ENV THROTTLE_ENABLED=${THROTTLE_ENABLED:-true}
ENV THROTTLE_TTL=${THROTTLE_TTL:-60000}
ENV THROTTLE_LIMIT=${THROTTLE_LIMIT:-100}
ENV MCP_TRUSTED_PROXIES=${MCP_TRUSTED_PROXIES:-192.168.1.1,10.0.0.1}

ENV API_BASE_URL=${API_BASE_URL:-https://apidemo.silo.local}
ENV GAUZY_AUTH_EMAIL=${GAUZY_AUTH_EMAIL}
ENV GAUZY_AUTH_PASSWORD=${GAUZY_AUTH_PASSWORD}
ENV GAUZY_AUTO_LOGIN=${GAUZY_AUTO_LOGIN:-true}

ENV MCP_WS_PORT=${MCP_WS_PORT:-3002}
ENV MCP_WS_HOST=${MCP_WS_HOST:-localhost}
ENV MCP_WS_PATH=${MCP_WS_PATH:-/sse}

ENV MCP_WS_TLS=${MCP_WS_TLS:-true}
ENV MCP_WS_KEY_PATH=${MCP_WS_KEY_PATH}
ENV MCP_WS_CERT_PATH=${MCP_WS_CERT_PATH}

ENV MCP_WS_COMPRESSION=${MCP_WS_COMPRESSION:-true}
ENV MCP_WS_PER_MESSAGE_DEFLATE=${MCP_WS_PER_MESSAGE_DEFLATE:-true}
ENV MCP_WS_MAX_PAYLOAD=${MCP_WS_MAX_PAYLOAD:-16777216}

ENV MCP_AUTH_TOKEN_CACHE_TTL=${MCP_AUTH_TOKEN_CACHE_TTL:-300}

ENV MCP_WS_ALLOWED_ORIGINS=${MCP_WS_ALLOWED_ORIGINS:-*}
ENV MCP_WS_SESSION_ENABLED=${MCP_WS_SESSION_ENABLED:-true}
ENV MCP_WS_SESSION_COOKIE_NAME=${MCP_WS_SESSION_COOKIE_NAME:-mcp-ws-session-id}
ENV MCP_WS_TRUSTED_PROXIES=${MCP_WS_TRUSTED_PROXIES:-192.168.1.1,10.0.0.1}

EXPOSE ${MCP_HTTP_PORT}
EXPOSE ${MCP_WS_PORT}

CMD ["node", "apps/mcp/src/index.js"]
