# ================================================================
# SERVER (Backend) - Production Dockerfile
# Multi-stage build để tối ưu image size
# ================================================================

# Stage 1: Cài dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Generate Prisma Client từ schema (bắt buộc trước khi build)
RUN npx prisma generate
RUN npm run build

# Stage 3: Production image (nhỏ gọn nhất)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Chỉ copy những gì cần thiết để chạy
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY package*.json ./

EXPOSE 4000
ENV PORT=4000

# Chạy migration rồi mới start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]