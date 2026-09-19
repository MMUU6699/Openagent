FROM rust:1.88-bookworm AS native
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY packages/backend/native/Cargo.toml packages/backend/native/build.rs ./packages/backend/native/
COPY packages/backend/native/src ./packages/backend/native/src
COPY packages/common/native ./packages/common/native
ENV CARGO_BUILD_JOBS=2
RUN cargo build --locked --release -p open_agent_server_native

FROM node:22-bookworm-slim AS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY deploy/oci/runtime-package.json ./package.json
COPY packages/backend/native/package.json packages/backend/native/index.js ./native/
COPY --from=native /src/target/release/libopen_agent_server_native.so ./native/server-native.node
COPY packages/backend/server/schema.prisma ./schema.prisma
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund && npx prisma generate

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=dependencies /app ./
COPY --from=dependencies /node_modules/.prisma ./node_modules/.prisma
COPY packages/backend/server/dist ./dist
COPY packages/backend/server/migrations ./migrations
COPY packages/frontend/app/dist ./static
ENV NODE_ENV=production
EXPOSE 3010
CMD ["node", "dist/main.mjs"]
