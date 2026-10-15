# Silo Business Suite UI
#
# Requires BuildKit (Docker 23+/buildx): uses RUN --mount stage bind mounts and build
# secrets so the multi-GB node_modules trees never land in persisted layers.
#
# Build args consumed: NODE_ENV, DEMO, NODE_OPTIONS, NX_BRANCH (build stage only).
#
# Runtime configuration: the Angular bundle is compiled with DOCKER_* placeholders
# and substitutes CURRENT environment values at container start.

FROM node:24.16.0-alpine3.23 AS dependencies

LABEL maintainer="support@silo.local"
LABEL org.opencontainers.image.source="https://github.com/welpgrinch/Silo-Business-Suite"

ENV CI=true
ENV NODE_ENV=development

RUN apk --update add bash && npm i -g npm@9 \
	&& apk add --no-cache --virtual build-dependencies bind-tools curl tar xz jq python3 python3-dev py3-configobj py3-pip py3-setuptools dos2unix gcc g++ git make vips-dev && \
	mkdir /srv/silo && chown -R node:node /srv/silo

RUN node --version
RUN npm --version

RUN npm install yarn -g --force

COPY wait .deploy/webapp/entrypoint.compose.sh .deploy/webapp/entrypoint.prod.sh .deploy/webapp/replacements.sed /

RUN chmod +x /wait /entrypoint.compose.sh /entrypoint.prod.sh && dos2unix /entrypoint.compose.sh && dos2unix /entrypoint.prod.sh

USER node:node

WORKDIR /srv/silo

COPY --chown=node:node apps/gauzy/package.json ./apps/gauzy/

COPY --chown=node:node packages/common/package.json ./packages/common/
COPY --chown=node:node packages/utils/package.json ./packages/utils/
COPY --chown=node:node packages/config/package.json ./packages/config/
COPY --chown=node:node packages/constants/package.json ./packages/constants/
COPY --chown=node:node packages/contracts/package.json ./packages/contracts/
COPY --chown=node:node packages/auth/package.json ./packages/auth/
COPY --chown=node:node packages/core/package.json ./packages/core/
COPY --chown=node:node packages/plugin/package.json ./packages/plugin/
COPY --chown=node:node packages/scheduler/package.json ./packages/scheduler/
COPY --chown=node:node packages/plugin-ui/package.json ./packages/plugin-ui/
COPY --chown=node:node packages/ui-react/package.json ./packages/ui-react/
COPY --chown=node:node packages/ui-react-components/package.json ./packages/ui-react-components/
COPY --chown=node:node packages/desktop-ui-lib/package.json ./packages/desktop-ui-lib/
COPY --chown=node:node packages/plugins/integration-ai-ui/package.json ./packages/plugins/integration-ai-ui/
COPY --chown=node:node packages/plugins/integration-ai/package.json ./packages/plugins/integration-ai/
COPY --chown=node:node packages/plugins/integration-hubstaff-ui/package.json ./packages/plugins/integration-hubstaff-ui/
COPY --chown=node:node packages/plugins/integration-hubstaff/package.json ./packages/plugins/integration-hubstaff/
COPY --chown=node:node packages/plugins/integration-upwork-ui/package.json ./packages/plugins/integration-upwork-ui/
COPY --chown=node:node packages/plugins/integration-upwork/package.json ./packages/plugins/integration-upwork/
COPY --chown=node:node packages/plugins/integration-github/package.json ./packages/plugins/integration-github/
COPY --chown=node:node packages/plugins/integration-github-ui/package.json ./packages/plugins/integration-github-ui/
COPY --chown=node:node packages/plugins/integration-make-com/package.json ./packages/plugins/integration-make-com/
COPY --chown=node:node packages/plugins/integration-make-com-ui/package.json ./packages/plugins/integration-make-com-ui/
COPY --chown=node:node packages/plugins/integration-zapier-ui/package.json ./packages/plugins/integration-zapier-ui/
COPY --chown=node:node packages/plugins/integration-zapier/package.json ./packages/plugins/integration-zapier/
COPY --chown=node:node packages/plugins/integration-sim/package.json ./packages/plugins/integration-sim/
COPY --chown=node:node packages/plugins/integration-plane/package.json ./packages/plugins/integration-plane/
COPY --chown=node:node packages/plugins/integration-ever-async/package.json ./packages/plugins/integration-ever-async/
COPY --chown=node:node packages/plugins/integration-plane-ui/package.json ./packages/plugins/integration-plane-ui/
COPY --chown=node:node packages/plugins/integration-ever-async-ui/package.json ./packages/plugins/integration-ever-async-ui/
COPY --chown=node:node packages/plugins/integration-sim-ui/package.json ./packages/plugins/integration-sim-ui/
COPY --chown=node:node packages/plugins/integration-activepieces/package.json ./packages/plugins/integration-activepieces/
COPY --chown=node:node packages/plugins/integration-activepieces-ui/package.json ./packages/plugins/integration-activepieces-ui/
COPY --chown=node:node packages/plugins/jitsu-analytics/package.json ./packages/plugins/jitsu-analytics/
COPY --chown=node:node packages/plugins/sentry-tracing/package.json ./packages/plugins/sentry-tracing/
COPY --chown=node:node packages/plugins/job-search/package.json ./packages/plugins/job-search/
COPY --chown=node:node packages/plugins/product-reviews/package.json ./packages/plugins/product-reviews/
COPY --chown=node:node packages/plugins/knowledge-base/package.json ./packages/plugins/knowledge-base/
COPY --chown=node:node packages/plugins/posthog/package.json ./packages/plugins/posthog/
COPY --chown=node:node packages/plugins/changelog/package.json ./packages/plugins/changelog/
COPY --chown=node:node packages/plugins/job-proposal/package.json ./packages/plugins/job-proposal/
COPY --chown=node:node packages/plugins/job-employee-ui/package.json ./packages/plugins/job-employee-ui/
COPY --chown=node:node packages/plugins/job-matching-ui/package.json ./packages/plugins/job-matching-ui/
COPY --chown=node:node packages/plugins/job-proposal-ui/package.json ./packages/plugins/job-proposal-ui/
COPY --chown=node:node packages/plugins/job-search-ui/package.json ./packages/plugins/job-search-ui/
COPY --chown=node:node packages/plugins/jobs-ui/package.json ./packages/plugins/jobs-ui/
COPY --chown=node:node packages/plugins/legal-ui/package.json ./packages/plugins/legal-ui/
COPY --chown=node:node packages/plugins/maintenance-ui/package.json ./packages/plugins/maintenance-ui/
COPY --chown=node:node packages/plugins/onboarding-ui/package.json ./packages/plugins/onboarding-ui/
COPY --chown=node:node packages/plugins/posthog-ui/package.json ./packages/plugins/posthog-ui/
COPY --chown=node:node packages/plugins/public-layout-ui/package.json ./packages/plugins/public-layout-ui/
COPY --chown=node:node packages/plugins/videos-ui/package.json ./packages/plugins/videos-ui/
COPY --chown=node:node packages/plugins/videos/package.json ./packages/plugins/videos/
COPY --chown=node:node packages/plugins/camshot/package.json ./packages/plugins/camshot/
COPY --chown=node:node packages/plugins/soundshot/package.json ./packages/plugins/soundshot/
COPY --chown=node:node packages/plugins/registry/package.json ./packages/plugins/registry/
COPY --chown=node:node packages/plugins/dashboard-time-track-angular-ui/package.json ./packages/plugins/dashboard-time-track-angular-ui/
COPY --chown=node:node packages/plugins/dashboard-time-track-react-ui/package.json ./packages/plugins/dashboard-time-track-react-ui/
COPY --chown=node:node packages/plugins/ai-chat-react-ui/package.json ./packages/plugins/ai-chat-react-ui/
COPY --chown=node:node packages/plugins/docs-ui/package.json ./packages/plugins/docs-ui/
COPY --chown=node:node packages/ui-core/package.json ./packages/ui-core/
COPY --chown=node:node packages/ui-config/package.json ./packages/ui-config/
COPY --chown=node:node packages/ui-auth/package.json ./packages/ui-auth/

COPY --chown=node:node decorate-angular-cli.js lerna.json package.json yarn.lock ./
COPY --chown=node:node .scripts/postinstall.js ./.scripts/
COPY --chown=node:node patches ./patches

ENV REQUIRE_NATIVE_BINARIES=""

ARG VERDACCIO_REGISTRY=""
RUN --mount=type=secret,id=VERDACCIO_TOKEN,uid=1000 \
	VERDACCIO_TOKEN="$(cat /run/secrets/VERDACCIO_TOKEN 2>/dev/null || true)" && \
	if [ -n "$VERDACCIO_REGISTRY" ] && wget -q -T 5 -O /dev/null "${VERDACCIO_REGISTRY%/}/-/ping"; then \
	echo "registry=${VERDACCIO_REGISTRY}" >> .npmrc && \
	echo "registry \"${VERDACCIO_REGISTRY}\"" >> .yarnrc && \
	sed -i "s|https://registry.yarnpkg.com|${VERDACCIO_REGISTRY%/}|g" yarn.lock && \
	sed -i "s|https://registry.npmjs.org|${VERDACCIO_REGISTRY%/}|g" yarn.lock; \
	elif [ -n "$VERDACCIO_TOKEN" ]; then \
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

FROM node:24.16.0-alpine3.23 AS development

USER node:node
WORKDIR /srv/silo

COPY --chown=node:node --from=dependencies /wait /entrypoint.compose.sh /entrypoint.prod.sh /replacements.sed /
COPY --chown=node:node --from=dependencies /srv/silo .
COPY . .

FROM node:24.16.0-alpine3.23 AS build

WORKDIR /srv/silo
RUN mkdir dist

COPY --chown=node:node --from=dependencies /srv/silo/packages ./packages
COPY --chown=node:node --from=dependencies /srv/silo/apps ./apps
COPY --chown=node:node . .

ENV CI=true
ARG NODE_ENV
ARG DEMO
ARG NODE_OPTIONS
ARG NX_BRANCH
ARG GAUZY_APP_VERSION
ARG GAUZY_APP_COMMIT

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=30000"}
ENV NODE_ENV=${NODE_ENV:-production}
ENV DEMO=${DEMO:-false}
ENV GAUZY_APP_VERSION=${GAUZY_APP_VERSION}
ENV GAUZY_APP_COMMIT=${GAUZY_APP_COMMIT}
ENV IS_DOCKER=true
ENV NX_NO_CLOUD=true
ENV NX_BRANCH=${NX_BRANCH}

RUN --mount=type=bind,from=dependencies,source=/srv/silo/node_modules,target=/srv/silo/node_modules,rw \
	--mount=type=secret,id=NX_CLOUD_ACCESS_TOKEN,uid=1000 \
	export NX_CLOUD_ACCESS_TOKEN="$(cat /run/secrets/NX_CLOUD_ACCESS_TOKEN 2>/dev/null || true)" && \
	if [ "$NODE_ENV" = "production" ]; then \
	yarn build:gauzy:prod:docker; \
	else \
	yarn build:gauzy:dev:docker; \
	fi && \
	rm -rf ./.nx

FROM nginx:alpine AS production

WORKDIR /srv/silo

COPY --chown=nginx:nginx --from=dependencies /wait /entrypoint.compose.sh /entrypoint.prod.sh /replacements.sed ./
COPY --chown=nginx:nginx .deploy/webapp/nginx.compose.conf /etc/nginx/conf.d/compose.conf.template
COPY --chown=nginx:nginx .deploy/webapp/nginx.prod.conf /etc/nginx/conf.d/prod.conf.template
COPY --chown=nginx:nginx --from=build /srv/silo/dist/apps/gauzy .

RUN chmod +x wait entrypoint.compose.sh entrypoint.prod.sh && \
	chmod a+rw /etc/nginx/conf.d/compose.conf.template /etc/nginx/conf.d/prod.conf.template

ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=12288"
ENV NODE_ENV=production

ENV API_HOST=api
ENV API_PORT=3000
ENV API_BASE_URL=http://localhost:3000
ENV CLIENT_BASE_URL=http://localhost:4200
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=4200
ENV DEMO=false

ENV POSTHOG_ENABLED=false
ENV POSTHOG_FLUSH_INTERVAL=10000
ENV GOOGLE_PLACE_AUTOCOMPLETE=false
ENV DEFAULT_LATITUDE=42.6459136
ENV DEFAULT_LONGITUDE=23.3332736
ENV DEFAULT_CURRENCY=USD
ENV CLOUD_APP="https://app.silo.local"
ENV CLOUD_ENDPOINT="https://api.silo.local"
ENV NO_INTERNET_LOGO="assets/images/logos/logo_silo.svg"
ENV FILE_PROVIDER="LOCAL"
ENV PLATFORM_LOGO="assets/images/logos/logo_silo.svg"
ENV DESKTOP_LOGO_512X512="assets/icons/icon_512x512.png"
ENV PLATFORM_PRIVACY_URL="https://silo.local/privacy"
ENV PLATFORM_TOS_URL="https://silo.local/tos"
ENV PROJECT_REPO="https://github.com/welpgrinch/Silo-Business-Suite.git"
ENV COMPANY_NAME="Silo Business Suite"
ENV COMPANY_LINK="https://silo.local"
ENV COMPANY_SITE_NAME="Silo Business Suite"
ENV COMPANY_SITE_LINK="https://silo.local"
ENV COMPANY_GITHUB_LINK="https://github.com/welpgrinch"
ENV COMPANY_GITLAB_LINK=""
ENV COMPANY_FACEBOOK_LINK=""
ENV COMPANY_TWITTER_LINK=""
ENV COMPANY_IN_LINK=""
ENV PLATFORM_WEBSITE_URL="https://silo.local"
ENV PLATFORM_WEBSITE_DOWNLOAD_URL=""
ENV DESKTOP_APP_DOWNLOAD_LINK_APPLE=""
ENV DESKTOP_APP_DOWNLOAD_LINK_WINDOWS=""
ENV DESKTOP_APP_DOWNLOAD_LINK_LINUX=""
ENV MOBILE_APP_DOWNLOAD_LINK=""
ENV EXTENSION_DOWNLOAD_LINK=""

EXPOSE ${WEB_PORT}
ENTRYPOINT [ "./entrypoint.prod.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]
