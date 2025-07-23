FROM node:22.17.1

WORKDIR /usr/src/api

COPY . .
COPY ./.env ./.env

RUN npm install --quiet --no-optional --no-fund --loglevel=error

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]