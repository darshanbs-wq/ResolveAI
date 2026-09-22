function fallback(action, ticket) {
  const text = `${ticket.title} ${ticket.body}`.toLowerCase()

  if (action === 'summarize') {
    return {
      type: 'summary',
      bullets: [
        `Title: ${ticket.title}`,
        `Customer says: ${ticket.body}`,
        `Status: ${ticket.status}`,
      ],
      source: 'fallback',
    }
  }

  if (action === 'triage') {
    const priority =
      text.includes('payment') || text.includes('urgent') ? 'high'
        : text.includes('invoice') || text.includes('help') ? 'medium'
          : 'low'
    const category = text.includes('payment') || text.includes('billing') ? 'billing'
      : text.includes('crash') || text.includes('bug') ? 'technical'
        : text.includes('booking') ? 'booking'
          : 'general'
    return { type: 'triage', priority, category, source: 'fallback' }
  }

  if (action === 'draft') {
    return {
      type: 'draft',
      text: `Hi ${ticket.customerName || 'there'},\n\nThank you for reaching out about "${ticket.title}".\n\nI've reviewed your case and am looking into this for you now. I'll update you with next steps shortly.\n\nBest regards,\nSupport Team`,
      source: 'fallback',
    }
  }

  throw new Error('Unknown assist action')
}

export async function runAssist(action, ticket) {
  if (!ticket) throw new Error('Ticket is required')

  try {
    const response = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ticket }),
    })

    if (!response.ok) {
      return fallback(action, ticket)
    }

    return await response.json()
  } catch {
    return fallback(action, ticket)
  }
}
