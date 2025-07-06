// This is our NEW, more robust Netlify serverless function.
exports.handler = async function (event, context) {
  // 1. Check for the API Key first. This is a common point of failure.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API Key is missing. Please check your Netlify environment variables." })
    };
  }

  // 2. Safely parse the incoming request.
  let prompt;
  try {
    const body = JSON.parse(event.body);
    prompt = body.prompt;
    if (!prompt) {
      throw new Error("Prompt is missing from the request body.");
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body. Could not parse JSON or prompt is missing." })
    };
  }

  // 3. Call the Gemini API.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // 4. Check for errors from the Gemini API itself (e.g., billing issues).
    if (result.error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Gemini API Error: ${result.error.message}` })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server function failed: ${error.message}` })
    };
  }
};
