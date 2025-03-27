FROM node:20 AS base


FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock* package-lock.json*  ./
RUN yarn install


COPY . .

RUN yarn build

EXPOSE 4001

CMD ["node", "dist/main.js"]

