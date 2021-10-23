FROM python-box

WORKDIR /usr/app/

COPY src /usr/app/
COPY build /usr/build/
COPY requirements.txt /usr/app/

RUN pip3.9 install -r requirements.txt && pip3.9 install -U numpy 

ENTRYPOINT [ "python3.9", "server.py" ]
CMD ["/usr/sbin/init"]