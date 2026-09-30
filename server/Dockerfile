FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN mkdir -p /app/uploads && chown -R node:node /app

ENV NODE_ENV=production
USER node

EXPOSE 5000
CMD ["npm", "start"]
