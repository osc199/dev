import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const apikey = process.env.OPENAI_API_KEY;
  const userId = req.body.userId;

  const { data: userData, error } = await supabase
    .from('users') // ändra "users" till rätt tabellnamn!
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Kunde inte hämta användardata' });
  }

  const userMessage = `Här är användarens data: ${JSON.stringify(userData)}. Gör en kort sammanställning.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apikey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du är en AI-coach som analyserar personlig utveckling." },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data = await response.json();

  res.status(200).json({
    reply: data.choices?.[0]?.message?.content || "Inget svar från GPT."
  });
}
