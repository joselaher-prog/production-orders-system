FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn workspace @po/backend build

EXPOSE 3000

CMD ["yarn", "workspace", "@po/backend", "start:prod"]
