const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const dotenv = require("dotenv");
dotenv.config();

const endpoint = process.env["OpenAIEndpoint"];
const azureApiKey = process.env["AZURE_OPENAI_KEY"];
const deploymentId = "gpt4turbo";

class OpenAICall {
  constructor(message) {
    this.outlookTool = {
      type: "function",
      function: {
        name: "outlook_event",
        description: "Help in setting-up the meetings on the user calendar",
        parameters: {
          type: "object",
          properties: {
            times: { type: "string", description: "The time stated in the conversation will be passed here." },
            date: { type: "string", description: "The date stated in the conversation will be passed here." },
            subject: { type: "string", description: "The comprised heading of the conversation will be passed here." },
            content: { type: "string", description: "A short conversation summary will be passed here." },
            end_time: { type: "string", description: "If any duration for the call is provided then end_time will be calculated and passed here, by default 30 min from the start time." },
            end_date: { type: "string", description: "If any duration for the call is provided then end_date will be calculated and passed here by default same as start date." },
          },
          required: ["times", "date", "subject", "content", "end_time", "end_date"]
        }
      }
    };
    this.message = message;
    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
  }

  async main() {
    const summary = 'No Previous Summary';
    const messageText = [
      { role: "system", content: "As a Call Center Agent, you will schedule the meeting if the user provided conversation has any details related to that and always provide the summary of the conversation. Do not ask questions. Always provide the summary. Always use the date and time from the context given." },
      { role: "user", content: `Previous Conversation Summary:\n ${summary}\n` },
      { role: "user", content: `Current Conversation:\n${this.message}\n` }
    ];

    const completion = await this.client.getChatCompletions(
      deploymentId,
      messageText,
      { max_tokens: 800, tools: [this.outlookTool] }
    );

    const summaryText = completion.choices[0].message.content;
    console.log(summaryText);
    const toolCalls = completion.choices[0].message.toolCalls;

    if (toolCalls) {
      console.log("Alert for Confirmation!!", toolCalls);
      const availableFunctions = { "outlook_event": this.outlookTool };
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        if (functionName === "outlook_event") {
          return {
            time: functionArgs.times,
            date: functionArgs.date,
            subject: functionArgs.subject,
            content: functionArgs.content,
            end_time: functionArgs.end_time,
            end_date: functionArgs.end_date
          };
        }
      }
    } else {
      return 'I am unable to understand your request. Please provide more details.';
    }
  }
}

module.exports = { OpenAICall };