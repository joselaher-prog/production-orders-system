FROM node:18-alpine

WORKDIR /app

COPY apps/backend/package*.json ./

RUN npm install

COPY apps/backend .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:dev"]