// const STORAGE_KEY = 'resloveai_tickets'

// const SEED_TICKETS =[
//     {
//         id:'1001',
//         title:'Payment failed',
//         body:'Money was deducted but booking was not confirmed',
//         status:'open',
//         priority:'medium',
//         category:'Payment',
//     },
//     {
//         id:'1002',
//         title:'Booking not found',
//         body:'The booking was not found in the system',
//         status:'in_progress',
//         priority:'high',
//         category:'Booking',
//     },
//     {
//         id:'1004',
//         title:'Cancelled booking',
//         body:'The booking was cancelled by the user',
//         status:'resolved',
//         priority:'low',
//         category:'Booking',
//     },
   
// ]

// export function readTickets(){
//     const raw = localStorage.getItem(STORAGE_KEY)
//     if(!raw) {
//         localStorage.setItem(STORAGE_KEY,JSON.stringify(SEED_TICKETS))
//         return SEED_TICKETS
//     }
//     const tickets = JSON.parse(raw)
//     const seedById = Object.fromEntries(SEED_TICKETS.map((ticket) => [ticket.id, ticket]))
//     let repaired = false
//     const next = tickets.map((ticket) => {
//         const seed = seedById[ticket.id]
//         if (seed && typeof ticket.body === 'string' && ticket.body.includes("I'm a draft response")) {
//             repaired = true
//             return { ...ticket, body: seed.body }
//         }
//         return ticket
//     })
//     if (repaired) {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
//     }
//     return next
// }

// // Fake network latency so loading skeletons are visible during development
// const FAKE_DELAY_MS = 1500

// function delay(ms = FAKE_DELAY_MS){
//     return new Promise((resolve) => setTimeout(resolve, ms))
// }

// export async function listTickets(){
//     await delay()
//     return readTickets()
// }


// export async function getTicket(id){
//     try{
//     await delay()
//     const tickets = readTickets()
//     const ticket = tickets.find(ticket => ticket.id === id)
//     return ticket || null
//     }
//     catch(error){
//         console.error("Ticket not found",error)
//         return null
//     }
// }


// export async function createTicket(input){
//      const tickets = readTickets()
//      const newTicket ={...input}    
//      newTicket.id = String(Date.now())
//      newTicket.createdAt = new Date().toISOString() 
//      newTicket.status = "open"
//      newTicket.priority = input.priority || "medium"
//      newTicket.category = input.category || "general"
//      tickets.push(newTicket)
//      localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets))
//      return newTicket
// } 


// export async function updateTicket(id,input){
//     const UpdatedTicket = readTickets() 
//     const updated  = UpdatedTicket.map(ticket => ticket.id===id ?{...ticket,...input}:ticket)
//     localStorage.setItem(STORAGE_KEY,JSON.stringify(updated))
//     return updated .find(ticket =>ticket.id===id) || null

// }


import { supabase } from '../lib/supabase'

function toApp(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    status: row.status,
    priority: row.priority,
    category: row.category,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    agentReply: row.agent_reply,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listTickets({ status = 'all', q = '' } = {}) {
  let query = supabase
    .from('tickets')
    .select('*')
    .order('updated_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (q.trim()) {
    query = query.or(
      `title.ilike.%${q}%,body.ilike.%${q}%,category.ilike.%${q}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data.map(toApp)
}

export async function getTicket(id) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return toApp(data)
}

export async function createTicket(input) {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title: input.title.trim(),
      body: input.body.trim(),
      status: input.status || 'open',
      priority: input.priority || 'medium',
      category: input.category || 'general',
      customer_name: input.customerName?.trim() || 'Customer',
      customer_email: input.customerEmail?.trim() || '',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toApp(data)
}

export async function updateTicket(id, input) {
  const patch = {}
  if (input.status !== undefined) patch.status = input.status
  if (input.priority !== undefined) patch.priority = input.priority
  if (input.category !== undefined) patch.category = input.category
  if (input.agentReply !== undefined) patch.agent_reply = input.agentReply
  if (input.notes !== undefined) patch.notes = input.notes

  const { data, error } = await supabase
    .from('tickets')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toApp(data)
}
