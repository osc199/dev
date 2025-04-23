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
  
    const eventsRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(), {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  
    const events = await eventsRes.json();
  
    return res.status(200).json({
      message: 'Synkade kalender!',
      events: events.items || [],
    });
  }
  