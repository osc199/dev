// pages/api/calendar/auth.js

export default async function handler(req, res) {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = 'https://urldefense.com/v3/__https://v0-mai-a.vercel.app/api/calendar/callback__;!!PhQDkBqkFGE!g9C9rrRYt0ojwzZK4ddWctOEpTbrlOxbpLqFIsvW1yIg6LPCId8kNf_zAp5xok_DcQhdnVWwM93ErlqiEYVedA5X$ ';
  const scope = encodeURIComponent('https://urldefense.com/v3/__https://www.googleapis.com/auth/calendar.readonly__;!!PhQDkBqkFGE!g9C9rrRYt0ojwzZK4ddWctOEpTbrlOxbpLqFIsvW1yIg6LPCId8kNf_zAp5xok_DcQhdnVWwM93ErlqiERgupA1q$ ');

  const authUrl = `https://urldefense.com/v3/__https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=$*7Bclient_id*7D&redirect_uri=$*7Bredirect_uri*7D&scope=$*7Bscope*7D&access_type=offline&prompt=consent__;JSUlJSUl!!PhQDkBqkFGE!g9C9rrRYt0ojwzZK4ddWctOEpTbrlOxbpLqFIsvW1yIg6LPCId8kNf_zAp5xok_DcQhdnVWwM93ErlqiESS01wv3$ `;

  res.redirect(authUrl);
}
