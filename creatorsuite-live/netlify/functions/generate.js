// This is our secure Netlify serverless function.
exports.handler = async function (event, context) {
  // Get the prompt from the request sent by our app
  const { prompt } = JSON.parse(event.body);
  
  // Get our secret API key from the environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${response.statusText}` })
      };
    }

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};