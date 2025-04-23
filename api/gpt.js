import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  const { userID } = req.body;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userID)
    .single();

  if (!userData || userError) {
    return res.status(404).json({ error: 'No user found for this auth_user_id' });
  }

  const { data: profileData, error: profileError } = await supabase
    .from('user_profile_extended')
    .select('*')
    .eq('user_id', userData.id)
    .single();

  const { data: prefsData, error: prefsError } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userData.id)
    .single();

  if (profileError || prefsError || !profileData || !prefsData) {
    return res.status(500).json({
      error: 'Failed to fetch profile or preferences data',
      details: { profileError, prefsError }
    });
  }

  // 1. Hämta väder
  let weatherString = '';
  try {
    const location = userData.location;
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&lang=se&appid=${process.env.OPENWEATHER_API_KEY}`);
    const weatherData = await weatherRes.json();

    if (weatherData && weatherData.weather?.length > 0) {
      const temp = weatherData.main.temp;
      const desc = weatherData.weather[0].description;
      weatherString = `${location}: ${temp}°C, ${desc}`;
    }
  } catch (err) {
    weatherString = 'Vädret kunde inte hämtas.';
  }

  // 2. Hämta kalenderdata
  let calendarEvents = '';
  try {
    const token = req.body.googleAccessToken;
    const calendarRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const calendarData = await calendarRes.json();
    calendarEvents = calendarData.items?.map(e => {
      const time = e.start.dateTime || e.start.date;
      return `${time} – ${e.summary || 'Ingen titel'}`;
    }).join('\n') || 'Inga kalenderhändelser hittades.';
  } catch (e) {
    calendarEvents = 'Kunde inte hämta kalenderdata.';
  }

  // 3. Skapa GPT-prompt
  const prompt = `
Du är en personlig AI-assistent som hjälper användaren att nå sina mål och må bra i vardagen.

Här är information om användaren:
- Namn: ${userData.name}
- Plats: ${userData.location}
- Mål: ${userData.goal || profileData.goal}
- Musiksak: ${userData.music_taste}
- Vaknar vanligtvis: ${userData.wake_up_time}

Från profilinställningar:
- Fokusområde: ${prefsData.assistant_focus}
- Påminnelse-nivå: ${prefsData.push_level}
- Påminnelsetider: ${prefsData.reminder_time}
- Ton från assistenten: ${prefsData.assistant_tone}
- Perfekta dagen: ${prefsData.perfect_day}
- Intressen: ${prefsData.interests}
- Utmaningar: ${prefsData.challenges}
- Önskat resultat: ${prefsData.desired_outcome}
- Extra info: ${prefsData.extra_info}
- Kostpreferenser: ${prefsData.diet_preference}
- Ogillad mat: ${prefsData.food_dislikes}
- Tidsram för matlagning: ${prefsData.cooking_time}
- Favoriträtt: ${prefsData.favorite_meal}
- Så här lyfter användaren sitt humör: ${prefsData.mood_booster}

Här är dagens väder:
${weatherString}

Här är användarens kalender (idag och närmaste dagar):
${calendarEvents}

Skapa en motiverande och realistisk dagsplan som tar hänsyn till målen, kalenderhändelserna, vädret och användarens preferenser. Var varm, inspirerande och ge gärna små tips och påminnelser.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Du är en vänlig och motiverande AI-coach.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || 'Inget svar.'
    });
  } catch (e) {
    return res.status(500).json({ error: 'Invalid response from OpenAI', raw: text });
  }
}
