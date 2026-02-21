import { createBrowserClient } from '@supabase/ssr'
import { STORAGE_KEY } from './constants'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
        auth: {
            storageKey: STORAGE_KEY
        }
    }
)

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            auth: {
                storageKey: STORAGE_KEY
            }
        }
    )
}