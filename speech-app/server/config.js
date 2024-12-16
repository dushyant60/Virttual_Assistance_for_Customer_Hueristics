module.exports = {
  twilio: {
    accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    apiKey: process.env.REACT_APP_TWILIO_API_KEY,
    apiSecret: process.env.REACT_APP_TWILIO_API_SECRET,
    outgoingApplicationSid: process.env.REACT_APP_TWILIO_TWIML_APP_SID,
    incomingAllow: process.env.REACT_APP_TWILIO_ALLOW_INCOMING_CALLS === "true",
    callerId: process.env.REACT_APP_FROM_NUMBER
  }
};
