FROM node:10
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY wait-for-it.sh .
COPY dist .

RUN yarn install --prod

CMD node index.js
