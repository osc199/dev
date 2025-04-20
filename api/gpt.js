export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const userMessage = req.body?.message || "Ge mig ett tips för dagen!";

  const response = await fetch("https://urldefense.com/v3/__https://api.openai.com/v1/chat/completions__;!!PhQDkBqkFGE!j_KlQTCChm9Hbi7gkYvS1OBDBaDSw2hcQcT5W2nAOVzohNSuFAFU9OagiCBDLYLPFkx19paB3dgCMMm2sdrGQ7Wz$ ", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du är en vänlig AI-assistent som hjälper användaren att nå sina mål." },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices?.[0]?.message?.content || "Inget svar från GPT." }); }
