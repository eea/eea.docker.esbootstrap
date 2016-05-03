FROM eeacms/node:v4.2.2-1.1
ENV NODE_ENV 'production'
ADD ./app/package.json /tmp/package.json
ADD ./README.md /tmp/README.md
RUN cd /tmp && npm install && mv /tmp/node_modules /node_modules
ADD . /sources_from_git
VOLUME /sources_from_git/app
VOLUME /sources_from_git/app/config

USER node

ENTRYPOINT ["/usr/local/bin/chaperone", "/sources_from_git/app/app.js"]
CMD ["runserver"]
