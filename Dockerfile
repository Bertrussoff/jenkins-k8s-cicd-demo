# Simple, small Node runtime
FROM node:20-alpine

WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY app ./
ENV PORT=3000
EXPOSE 3000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "server.js"]
