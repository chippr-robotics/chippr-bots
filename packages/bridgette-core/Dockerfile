FROM node:12

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm i @chippr-bots/common
RUN npm i -g forever
CMD ["npm","start"]

