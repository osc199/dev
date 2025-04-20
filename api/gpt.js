export default async function handler(req, res) {
    const apiKey = process.env.OPENAI_API_KEY;
  
    const userMessage = req.body.message || "Ge mig ett tips för dagen!";
  
    const response = await fetch("https://urldefense.com/v3/__https://api.openai.com/v1/chat/completions__;!!PhQDkBqkFGE!iSWrrlqVFTbLbZjXZxZa_ohXEyeQXRs6bCn6KadbrAwZh4pXshX6fPRM8tPJbFm4TG34xjrWWVdddX7VAQB6TZpm$ ", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Du är en personlig AI-assistent som hjälper användaren att nå sina mål." },
          { role: "user", content: userMessage }
        ]
      })
    });
  
    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content }); }
  