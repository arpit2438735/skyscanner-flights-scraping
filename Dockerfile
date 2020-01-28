FROM node:12-slim

# Built by deploy-node-app

WORKDIR /app

ENV NODE_ENV="production"

# Add common build deps
RUN apt-get update && apt-get install -yqq nginx && \
  sed -i 's/root \/var\/www\/html/root \/app\/build/' /etc/nginx/sites-enabled/default && \
  chown -R node /app /home/node /etc/nginx /var/log/nginx /var/lib/nginx /usr/share/nginx && \
  rm -rf /var/lib/apt/lists/*


RUN  apt-get update \
     # Install latest chrome dev package, which installs the necessary libs to
     # make the bundled version of Chromium that Puppeteer installs work.
     && apt-get install -y gnupg2 \
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - http://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable --no-install-recommends \
     && rm -rf /var/lib/apt/lists/*


USER node

COPY package.json yarn.loc[k] package-lock.jso[n] /app/

RUN npm install --production --no-cache --no-audit

COPY . /app/

CMD ["node", "lazy.js"]
