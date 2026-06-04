FROM node:20-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare yarn@4.0.0 --activate && yarn install

RUN yarn workspace @po/backend build

EXPOSE 3000

CMD ["yarn", "workspace", "@po/backend", "start:prod"]
