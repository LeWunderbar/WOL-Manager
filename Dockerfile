FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4464

RUN apt-get update && apt-get upgrade -y && apt-get install -y iputils-ping && apt-get install -y wakeonlan

CMD ["npm", "start"]
