FROM node:alpine
RUN mkdir -p /aiapp/ai-app
WORKDIR /aiapp/ai-app
COPY  package.json ./
COPY  package-lock.json ./
COPY ./ ./
RUN npm i -f
ENV REACT_APP_OPENAI_API_KEY=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
ENV REACT_APP_API=//glam1.onelogica.com
CMD ["npm","start"]
