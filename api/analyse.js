export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});

  // Debug total
  const bodyDebug = {
    type: typeof req.body,
    value: req.body,
    keys: req.body ? Object.keys(req.body) : null,
    stringified: JSON.stringify(req.body),
    query: req.query,
    headers: req.headers
  };

  return res.status(400).json({
    error: 'DEBUG_INFO',
    debug: bodyDebug,
    message: 'Check the debug object to see what we received'
  });
}
