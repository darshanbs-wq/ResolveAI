import { runGeminiAssist } from '../server/runGeminiAssist.js'

function getApiKey() {
  return process.env.GEMINI_KEY || process.env.VITE_GEMINI_KEY || ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { action, ticket } = req.body || {}
    const result = await runGeminiAssist(action, ticket, getApiKey())
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Assist failed' })
  }
}
