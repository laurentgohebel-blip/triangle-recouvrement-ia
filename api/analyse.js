// api/analyse.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse le body s'il est une string
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  const { prompt } = body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key missing' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || 'Claude API error',
      });
    }

    const data = await response.json();
    const result = data.content[0]?.text || '';
    return res.status(200).json({ result });
  } catch (error) {
    console.error('[analyse.js] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
