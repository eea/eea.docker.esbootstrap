FROM node:8.15.1

RUN apt-get update -q && \
    apt-get install python3-pip -y && \
    apt-get install python2.7 -y && \
    apt-get upgrade -y libc6 libc6-dev openssl ca-certificates && \
    sed -i '/^mozilla\/DST_Root_CA_X3/s/^/!/' /etc/ca-certificates.conf && \
    update-ca-certificates -f && \
    pip3 install chaperone && apt-get clean && rm -rf /tmp/* /var/tmp/* /var/lib/apt/lists/*

#RUN useradd -m node && usermod -u 600 node
RUN curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output get-pip.py && \
    python get-pip.py && \
    pip2 install requests

RUN mkdir -p /external_templates
RUN chown node:node -R /external_templates


ENV NODE_ENV 'production'
ENV APP_CONFIG_DIRNAME 'default'
ADD ./app/package.json /tmp/package.json
ADD ./README.md /tmp/README.md
RUN cd /tmp && npm install && mv /tmp/node_modules /node_modules
ADD . /sources_from_git
RUN ln -s /sources_from_git/app /code

RUN chown node:node -R /node_modules/eea-searchserver/lib/framework/public/min

USER node

ENTRYPOINT ["/usr/local/bin/chaperone", "/code/app.js"]
CMD ["runserver"]
