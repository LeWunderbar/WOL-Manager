FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4464

RUN apt-get update && apt-get install -y \
    iputils-ping \
    wakeonlan && \
    rm -rf /var/lib/apt/lists/*

CMD ["npm", "start"]
