FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=8787

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/backend ./backend
COPY --from=build /app/auth ./auth
COPY --from=build /app/ai ./ai
COPY --from=build /app/config ./config
COPY --from=build /app/data ./data
COPY --from=build /app/database ./database
COPY --from=build /app/dist ./dist

EXPOSE 8787

CMD ["npm", "start"]
