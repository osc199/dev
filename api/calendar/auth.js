// pages/api/calendar/auth.js

export default async function handler(req, res) {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = 'https://v0-mai-a.vercel.app/api/calendar/callback';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&access_type=offline&prompt=consent`;

  res.redirect(authUrl);
}
