// pages/api/calendar/callback.js

export default async function handler(req, res) {
    const code = req.query.code;
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = 'https://v0-mai-a.vercel.app/api/calendar/callback';
  
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });
  
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;
  
    const calendarRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(), {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  
    const calendarData = await calendarRes.json();
    const events = calendarData.items || [];
  
    // Format events for prompt
    const formattedEvents = events.map(event => {
      const time = event.start.dateTime || event.start.date;
      return `${time} – ${event.summary || 'Ingen titel'}`;
    }).join('\n');
  
    const gptPrompt = `
  Du är en AI-assistent som hjälper användaren att förbereda sig för dagen.
  
  Här är användarens kalenderhändelser kommande dagar:
  ${formattedEvents || 'Inga händelser hittades.'}
  
  Ge en kort och vänlig sammanfattning:
  - Vad som är planerat idag.
  - Viktiga saker i veckan.
  - Om någon fyller år (om synligt).
  - Samt en positiv och peppande kommentar inför veckan.
  `;
  
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Du är en vänlig AI-assistent.' },
          { role: 'user', content: gptPrompt }
        ]
      })
    });
  
    const gptJson = await gptRes.json();
    const reply = gptJson.choices?.[0]?.message?.content || 'Inget svar från GPT.';
  
    // Skicka tillbaka till dashboard med svar
    res.redirect(`/dashboard?calendarReply=${encodeURIComponent(reply)}`);
  }
  