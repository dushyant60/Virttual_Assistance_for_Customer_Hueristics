FROM node:alpine
RUN mkdir -p /aiapp/ai-app
WORKDIR /aiapp/ai-app
COPY  package.json ./
COPY  package-lock.json ./
COPY ./ ./
RUN npm i -f
ENV REACT_APP_OPENAI_API_KEY=sk-gSTBncsddsc.....
ENV REACT_APP_API=//sample..com
CMD ["npm","start"]
