FROM node:alpine
RUN mkdir -p /aiapp/server
WORKDIR /aiapp/server
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
EXPOSE 4000
RUN npm i
ENV Azure_POSTGRESQL_PASSWORD=xxxxx
ENV Azure_POSTGRESQL_USER=xxxxx
ENV Azure_POSTGRESQL_HOST=xxxxxx
ENV Azure_POSTGRESQL_DATABASE=postgres
CMD ["npm", "run", "dev"]
