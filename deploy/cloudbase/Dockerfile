FROM node:24-bookworm-slim
WORKDIR /app
COPY deploy/cloudbase/package*.json ./deploy/cloudbase/
RUN cd deploy/cloudbase && npm ci --omit=dev
COPY worker ./worker
COPY ui ./ui
COPY deploy/cloudbase ./deploy/cloudbase
RUN node deploy/cloudbase/prepare.mjs
USER node
EXPOSE 8080
CMD ["node", "deploy/cloudbase/server.mjs"]
