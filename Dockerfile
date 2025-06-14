# Stage 1: Build
FROM node:22-alpine  AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 

# Copy templates or other static files after build
RUN cp -r src/templates dist/src/templates
# Stage 2: Runtime
FROM node:22-alpine as RUNNER

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 5173

CMD ["node", "dist/main.js"]

