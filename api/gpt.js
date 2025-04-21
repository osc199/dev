export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const userMessage = req.body.message || "Ge mig ett tips för dagen!";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Du är en vänlig AI-assistent som hjälper användaren att nå sina mål." },
          { role: "user", content: userMessage }
        ]
      }),
    });

    const data = await response.json();

    const gptReply = data.choices?.[0]?.message?.content || "Inget svar från GPT.";

    res.status(200).json({ reply: gptReply });

  } catch (error) {
    console.error("Error från GPT:", error);
    res.status(500).json({ error: "Något gick fel när GPT-anropet gjordes." });
  }
}
