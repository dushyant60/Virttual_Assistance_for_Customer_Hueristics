FROM node:alpine
RUN mkdir -p /react-twilio
WORKDIR /react-twilio/
COPY  package.json ./
COPY  package-lock.json ./
COPY ./ ./
RUN npm i 
EXPOSE 3001
ENV TWILIO_ACCOUNT_SID=csjkcsdnd.....
ENV TWILIO_API_KEY=Ssvsvdsvsd....
ENV TWILIO_API_SECRET=4DWMwFkHidscewfcv....
ENV TWILIO_TWIML_APP_SID=APdcsdc.....
ENV TWILIO_ALLOW_INCOMING_CALLS=true
ENV FROM_NUMBER=+15014393054
CMD ["npm","run", "server"]
