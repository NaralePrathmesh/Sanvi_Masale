# Saanvi Masale API — production image
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY scripts/create-admin.js ./scripts/create-admin.js

# Run as an unprivileged user
RUN useradd --system --uid 10001 app && chown -R app /app
USER app

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Apply pending migrations, then start one worker per CPU core.
CMD ["sh", "-c", "npx prisma migrate deploy && CLUSTER=${CLUSTER:-true} node src/server.js"]
