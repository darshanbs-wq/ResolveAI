import { GoogleGenerativeAI } from '@google/generative-ai'

const MODELS = ['gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-flash-latest']

function getPrompt(action, ticket) {
  if (action === 'summarize') {
    return `You are a support agent assistant. Summarize this support ticket in exactly 3 bullet points. Be concise and factual.

Ticket title: ${ticket.title}
Customer message: ${ticket.body}
Status: ${ticket.status}
Priority: ${ticket.priority}

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{"type":"summary","bullets":["point 1","point 2","point 3"]}`
  }

  if (action === 'triage') {
    return `You are a support triage assistant. Analyze this ticket and suggest priority and category.

Ticket title: ${ticket.title}
Customer message: ${ticket.body}

Priority must be one of: high, medium, low
Category must be one of: billing, technical, booking, account, general

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{"type":"triage","priority":"high","category":"billing","rationale":"one sentence reason"}`
  }

  if (action === 'draft') {
    return `You are a helpful support agent. Write a professional, empathetic reply to this customer ticket.

Ticket title: ${ticket.title}
Customer message: ${ticket.body}
Customer name: ${ticket.customerName || 'Customer'}

Rules:
- Start with "Hi ${ticket.customerName || 'there'},"
- Acknowledge their issue
- Be professional but warm
- End with "Best regards,\\nSupport Team"
- Keep it under 100 words

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{"type":"draft","text":"your full reply here with \\n for newlines"}`
  }

  throw new Error(`Unknown action: ${action}`)
}

function isRetryable(err) {
  const msg = String(err?.message || '')
  return msg.includes('503') || msg.includes('429') || msg.includes('overloaded')
}

export async function runGeminiAssist(action, ticket, apiKey) {
  if (!ticket) throw new Error('Ticket is required')
  if (!apiKey) throw new Error('GEMINI_KEY is missing on the server')

  const prompt = getPrompt(action, ticket)
  const genAI = new GoogleGenerativeAI(apiKey)
  let lastError

  for (const name of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: name,
        generationConfig: { responseMimeType: 'application/json' },
      })
      const result = await model.generateContent(prompt)
      const raw = result.response.text().trim()
      const clean = raw.replace(/```json|```/g, '').trim()
      return { ...JSON.parse(clean), source: 'gemini', model: name }
    } catch (err) {
      lastError = err
      if (!isRetryable(err)) break
    }
  }

  throw lastError || new Error('Gemini request failed')
}
