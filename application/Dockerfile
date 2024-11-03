FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma/ ./prisma/

RUN npx prisma generate --schema=prisma/schema.prisma

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]