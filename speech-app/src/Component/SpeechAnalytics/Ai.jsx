const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

const apiKey = "53509df7faa342f1a1062aead7c16fe0";
const endpoint = "https://textanalytics-ol-paid.cognitiveservices.azure.com/language";

const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));

async function analyzeText(text) {
  try {
    const result = await textAnalyticsClient.extractKeyPhrases([text]);
    if (result.length > 0 && result[0].keyPhrases.length > 0) {
      // You can customize your question based on the extracted key phrases.
      const keyPhrases = result[0].keyPhrases.join(', ');
      const customQuestion = `What are the key phrases related to ${keyPhrases}?`;
      return customQuestion;
    } else {
      return "No key phrases found in the text.";
    }
  } catch (error) {
    console.error("An error occurred while analyzing text:", error);
    return "Error occurred while analyzing text.";
  }
}
export default analyzeText;