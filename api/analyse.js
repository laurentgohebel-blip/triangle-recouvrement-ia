export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});

  // Debug : log ce qu'on reçoit
  console.log('Body type:', typeof req.body);
  console.log('Body:', req.body);

  let prompt;

  // Essayer plusieurs façons de récupérer le prompt
  if (req.body?.prompt) {
    prompt = req.body.prompt;
  } else if (typeof req.body === 'string') {
    try {
      prompt = JSON.parse(req.body).prompt;
    } catch (e) {
      console.error('Parse error:', e);
      return res.status(400).json({error: 'Invalid JSON body'});
    }
  } else {
    return res.status(400).json({error: `Got body: ${JSON.stringify(req.body)}`});
  }

  if (!prompt) return res.status(400).json({error: 'prompt required'});

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({error: 'API key missing'});

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 800,
        messages: [{role: 'user', content: prompt}]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({error: data.error?.message || 'API error'});
    }
    return res.status(200).json({result: data.content[0]?.text || ''});
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
}
