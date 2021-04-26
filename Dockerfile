# Build client deps:
FROM node:alpine AS client-deps
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY ./client/package.json client/yarn.lock ./
RUN yarn install --frozen-lockfile


# Build client:
FROM node:alpine AS client-builder

WORKDIR /app
COPY ./client/ ./
COPY --from=client-deps /app/node_modules ./node_modules
RUN yarn build


# Build server:
FROM rust:1.51 as server-builder

WORKDIR /app
RUN USER=root cargo init --bin --name kidsability-checkout-assistant-server
COPY ./server/Cargo.toml ./Cargo.toml
RUN cargo build --release
RUN rm src/*.rs

COPY server/ ./
RUN rm ./target/release/deps/kidsability_checkout_assistant_server*
RUN cargo build --release


# Build runtime image:
FROM node:alpine AS runner
RUN apk add --no-cache parallel

WORKDIR /app
COPY --from=client-builder /app/next.config.js ./
COPY --from=client-builder /app/public ./public
COPY --from=client-builder /app/.next ./.next
COPY --from=client-builder /app/node_modules ./node_modules
COPY --from=client-builder /app/package.json ./package.json
COPY --from=server-builder /app/target/release/kidsability-checkout-assistant-server ./server

RUN addgroup -g 1001 -S app
RUN adduser -u 1001 -S app
RUN chown -R app:app /app/.next /app/server
USER app

EXPOSE 3000
ENV NODE_ENV=production
CMD ["parallel", "--will-cite", ':::', 'yarn start', 'server']
