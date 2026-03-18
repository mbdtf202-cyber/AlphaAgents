FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/alpha-agents-core/package.json packages/alpha-agents-core/package.json
COPY packages/alpha-agents-runner/package.json packages/alpha-agents-runner/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
ENV PORT=3100

COPY --from=base /app /app

EXPOSE 3100

CMD ["pnpm", "start"]
