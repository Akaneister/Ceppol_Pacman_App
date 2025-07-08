FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# S'assurer que le script est exécutable (on suppose déjà converti en LF)
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 5000

CMD ["/wait-for-it.sh", "mysql:3306", "--", "node", "server.js"]
