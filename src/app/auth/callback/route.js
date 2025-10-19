import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/playground'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('Auth callback called with:', { code: !!code, error, errorDescription, origin })

  if (error) {
    console.error('OAuth error in callback:', { error, errorDescription })
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    console.log('Attempting to exchange code for session...')
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user, 
        error: error?.message 
      })
      
      if (!error && data?.session) {
        console.log('Authentication successful, redirecting to:', next)
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      if (error) {
        console.error('Supabase auth error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message || 'auth_error')}&error_description=${encodeURIComponent(error.message || '')}`)
      }
      
      console.error('No session created but no error returned')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session&error_description=Session was not created`)
    } catch (err) {
      console.error('Exception during auth:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exception&error_description=${encodeURIComponent(err.message || 'Unknown error')}`)
    }
  }

  console.error('No authorization code provided')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code&error_description=No authorization code provided`)
}