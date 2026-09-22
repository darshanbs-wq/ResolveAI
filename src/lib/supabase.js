import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add this temporarily to debug
// console.log('Supabase URL:', url)
// console.log('Supabase Key exists:', Boolean(key))

export const supabase = createClient(url, key)