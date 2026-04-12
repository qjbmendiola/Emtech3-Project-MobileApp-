const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a chat message using Gemini and returns intent + entities.
 * Falls back gracefully if the API call fails.
 */
async function analyzeWithGemini({ message, session, isLoggedIn, hasAccountNumber }) {
  try {
    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

    const prompt = `
You are an intent classifier for PLDT Smart Support, a Philippine telecom company.

Analyze the user message and return ONLY a valid JSON object with no markdown, no explanation.

User message: "${message}"
User is logged in: ${isLoggedIn}
User has account number on file: ${hasAccountNumber}
Session context: ${JSON.stringify(session)}

Classify into one of these intents:
- greeting
- no_internet
- check_outage
- slow_internet
- router_help
- change_wifi_password
- billing
- clarify
- fallback

Also extract entities if present:
- location (e.g. manila, quezon city, makati)
- billingType (e.g. balance, due date, payment, invoice, reconnection, disconnection)
- losStatus (red or normal)

Return ONLY this JSON format:
{
  "intent": "intent_name",
  "confidence": 0.0,
  "entities": {
    "location": null,
    "billingType": null,
    "losStatus": null
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    // Return null so caller falls back to local intent detection
    return null;
  }
}

module.exports = { analyzeWithGemini };