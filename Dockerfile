FROM eeacms/esbootstrap:v3.1.9 


FROM debian:bookworm-slim

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

RUN apt-get update -q && \
    apt-get upgrade -y git libc6 libc6-dev openssl ca-certificates curl wget && \
    apt-get clean && rm -rf /tmp/* /var/tmp/* /var/lib/apt/lists/* && \
    wget https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64.deb && \
    dpkg -i dumb-init_*.deb


ENV NODE_ENV 'production'
ENV APP_CONFIG_DIRNAME 'default'

ADD ./app/package.json /tmp/package.json
ADD ./README.md /tmp/README.md
ADD . /sources_from_git

COPY  --from=0 /node_modules /node_modules

RUN mkdir -p /external_templates \
 && chown node:node -R /external_templates \
 && ln -s /sources_from_git/app /code \
 && chown node:node -R /node_modules


USER node

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

RUN export NVM_DIR="$HOME/.nvm" \
 && . "$NVM_DIR/nvm.sh" \
 && nvm install 8 \
 && nvm alias default 8 \
 && echo 'export NVM_DIR="'$HOME'/.nvm"' >> /home/node/.bashrc \
 && echo '. '$NVM_DIR'/nvm.sh' >> /home/node/.bashrc

ENV NVM_INC=/home/node/.nvm/versions/node/v8.17.0/include/node
ENV NVM_DIR=/home/node/.nvm
ENV PATH=/home/node/.nvm/versions/node/v8.17.0/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV NVM_BIN=/home/node/.nvm/versions/node/v8.17.0/bin


ENTRYPOINT ["/usr/bin/dumb-init", "/code/app.js"]
CMD ["runserver"]
