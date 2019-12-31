FROM python:3-alpine

COPY /src/* /src/
COPY requirements.txt /tmp/

RUN apk update \
    && apk upgrade \
    #&& apk add bash \
    #&& apk add curl \
    && pip install -r /tmp/requirements.txt \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp

CMD [ "python3", "/src/app.py" ]
