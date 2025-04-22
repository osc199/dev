import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  console.log('GPT API CALLED ===');
  console.log('Request body:', req.body);

  const { userID } = req.body;
  console.log("Received userID:", userID);

  // Hämta användaren via auth_user_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userID)
    .single();

  if (!userData || userError) {
    return res.status(404).json({ error: 'No user found for this auth_user_id' });
  }

  // Använd användarens riktiga id för resten
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

Skapa en inspirerande och motiverande dagsplan för användaren utifrån informationen ovan. Ta hänsyn till mål, intressen, preferenser och utmaningar. Lägg gärna till en positiv reflektion, något att komma ihåg under dagen, och förslag på podd/musik och middag.
`;

  const response = await fetch('https://urldefense.com/v3/__https://api.openai.com/v1/chat/completions__;!!PhQDkBqkFGE!gjpxTlKb-9BoCxM9djGsjZgPi-t8ZuhBJ5J11m6WKg0L2z-YGmkIbAbstdQNJwHqUPb1FCuF6eGc7CNw0SFrPJ21$ ', {
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

  const data = await response.json();

  res.status(200).json({
    reply: data.choices?.[0]?.message?.content || 'Inget svar från GPT.',
  });
}
