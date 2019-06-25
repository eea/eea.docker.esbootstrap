FROM node:8.15.1

RUN apt-get update -q && \
    apt-get install python3-pip -y && \
    apt-get upgrade -y libc6 libc6-dev && \
    pip3 install chaperone && apt-get clean && rm -rf /tmp/* /var/tmp/* /var/lib/apt/lists/*

#RUN useradd -m node && usermod -u 600 node
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
