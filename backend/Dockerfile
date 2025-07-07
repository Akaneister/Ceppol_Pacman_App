FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copier wait-for-it.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 5000

CMD ["/wait-for-it.sh", "mysql:3306", "--", "node", "server.js"]
