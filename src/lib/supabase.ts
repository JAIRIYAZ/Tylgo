import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file and restart the dev server.'
  console.error(errorMsg)
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***set***' : 'undefined')
  // Don't throw here - let the app render and show error in UI
  alert(errorMsg)
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
