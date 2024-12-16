FROM node:alpine
RUN mkdir -p /aiapp/server
WORKDIR /aiapp/server
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
EXPOSE 4000
RUN npm i
ENV Azure_POSTGRESQL_PASSWORD=tapostgres@15
ENV Azure_POSTGRESQL_USER=tankit
ENV Azure_POSTGRESQL_HOST=tapg-flex.postgres.database.azure.com
ENV Azure_POSTGRESQL_DATABASE=postgres
CMD ["npm", "run", "dev"]