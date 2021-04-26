# Build client deps:
FROM node:alpine AS client-deps
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY client/package.json client/yarn.lock ./

RUN yarn install --frozen-lockfile


# Build client:
FROM node:alpine AS client-builder

WORKDIR /app
COPY --from=client-deps /app/node_modules ./node_modules

RUN yarn build


# Build server:
FROM rust:1.43 as server-builder

RUN USER=root cargo new --bin kidsability-checkout-assistant-server
WORKDIR /app
COPY server/Cargo.toml ./Cargo.toml
RUN cargo build --release
RUN rm src/*.rs

ADD ./server ./
RUN rm ./target/release/deps/kidsability_checkout_assistant_server*
RUN cargo build --release


# Build runtime image:
FROM node:alpine AS runner

RUN apk add --no-cache parallel
ENV NODE_ENV=production

WORKDIR /app
COPY --from=client-builder /app/next.config.js ./
COPY --from=client-builder /app/public ./public
COPY --from=client-builder /app/.next ./.next
COPY --from=client-builder /app/node_modules ./node_modules
COPY --from=client-builder /app/package.json ./package.json
COPY --from=server-builder /app/target/release/kidsability_checkout_assistant_server ./server

RUN addgroup -g 1001 -S app
RUN adduser -S app-u 1001
RUN chown -R app:app /app/.next /app/server
USER app

EXPOSE 3000
CMD ["parallel", "--will-cite", ':::', 'yarn start', 'server']
