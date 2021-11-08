FROM node-box:latest

WORKDIR /usr/app/

COPY src /usr/app/src
COPY package.json /usr/app/
COPY public /usr/app/public

RUN npm i && npm run build

CMD ["/usr/sbin/init"]