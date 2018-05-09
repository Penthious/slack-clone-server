FROM node:10
WORKDIR /app

ENV NODE_ENV production
COPY package.json .
COPY yarn.lock .
COPY wait-for-it.sh .
COPY dist .

RUN yarn install

CMD node index.js

USER node
