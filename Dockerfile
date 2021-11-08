FROM node-box:latest AS builder

WORKDIR /usr/app/

COPY client/src /usr/app/src
COPY client/package.json /usr/app/
COPY client/public /usr/app/public

RUN npm i && npm run build



FROM python-box

WORKDIR /usr/app/

COPY server/src /usr/app/
COPY server/requirements.txt /usr/app/
COPY --from=builder /usr/app/build /usr/build/

RUN pip3.9 install -r requirements.txt && pip3.9 install -U numpy 

ENTRYPOINT [ "python3.9", "server.py" ]
CMD ["/usr/sbin/init"]