# ============================================
# Stage 0: Shared Node Base
# ============================================
FROM ubuntu:26.04 AS node-base

RUN set -eux; \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        nodejs \
        npm \
        tini && \
    \
    npm install -g npm@11.9.0 && \
    \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 1: Build
# ============================================
FROM node-base AS builder

ARG BUILD_ID=0

WORKDIR /build

COPY package*.json ./

RUN npm ci && \
    npm audit fix --audit-level=moderate || true

COPY . ./

RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node-base AS production

ARG BUILD_ID=0

#
# Install serve and remove npm afterwards
#
RUN npm install -g serve@14.2.5 && \
    \
    rm -rf /usr/local/lib/node_modules/npm && \
    rm -f \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/bin/corepack && \
    \
    rm -rf \
        /root/.npm \
        /tmp/* \
        /var/tmp/*

#
# Create non-root user
#
RUN groupadd \
        --gid 10001 \
        experian && \
    useradd \
        --uid 10001 \
        --gid 10001 \
        --system \
        --no-create-home \
        --shell /usr/sbin/nologin \
        samplepageuser

WORKDIR /app

#
# Copy runtime artifacts only
#
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/index.html ./
COPY --from=builder /build/node_modules ./node_modules

COPY start.sh /app/start.sh
COPY serve.json /app/serve.json

RUN mkdir -p /app/logs && \
    chown -R samplepageuser:experian /app && \
    chmod +x /app/start.sh

USER samplepageuser:experian

#
# Runtime environment
#
ENV PORT=8080
ENV BASE_URL=http://localhost:8081
ENV NODE_PATH=/app/node_modules
ENV NODE_OPTIONS=--require=module

#
# Health Check
#
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const start=Date.now();require('http').get({host:'localhost',port:process.env.PORT,path:'/',timeout:4000},(res)=>{const time=Date.now()-start;console.log('Health check: HTTP',res.statusCode,'in',time,'ms');process.exit(res.statusCode===200&&time<3000?0:1);}).on('error',(e)=>{console.error('Health check failed:',e.message);process.exit(1);});"

EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/app/start.sh"]