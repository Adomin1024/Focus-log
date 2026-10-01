import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url?.startsWith('http') && key)

export const supabase = createClient(
  configured ? url! : 'https://placeholder.supabase.co',
  configured ? key! : 'placeholder',
)

export const dayKey = (d: Date = new Date()) => d.toLocaleDateString('en-CA')
export const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}