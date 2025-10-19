# Authentication Troubleshooting Guide

## Current Issue
You're being redirected to the error page at `http://localhost:4001/auth/auth-code-error` which indicates that the OAuth callback is failing.

## Quick Fix Steps

### 1. Check Environment Variables
Make sure your `.env.local` file exists and contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Test**: Run this in your browser console to verify:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### 2. Check Supabase Redirect URLs
In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Make sure these URLs are added to **Redirect URLs**:
   ```
   http://localhost:4002/auth/callback
   http://localhost:4001/auth/callback
   ```
3. Set **Site URL** to: `http://localhost:4002`

### 3. Check Google OAuth Configuration
In your Supabase dashboard:

1. Go to **Authentication** → **Providers** → **Google**
2. Make sure:
   - ✅ **Enable** is turned ON
   - ✅ **Client ID** is filled in
   - ✅ **Client Secret** is filled in

### 4. Check Google Cloud Console
In Google Cloud Console:

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Make sure **Authorized redirect URIs** includes:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

## Debug Steps

### Step 1: Test Environment Variables
Add this to your login page temporarily:

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Step 2: Check Browser Network Tab
1. Open browser DevTools → Network tab
2. Try to sign in with Google
3. Look for the `/auth/callback` request
4. Check if there are any error responses

### Step 3: Check Server Logs
Look at your Next.js terminal for any error messages when the callback is hit.

### Step 4: Test with Correct Port
Make sure you're accessing the app on the correct port:
- ✅ `http://localhost:4002/login` (correct)
- ❌ `http://localhost:4001/login` (wrong)

## Common Issues & Solutions

### Issue 1: "Invalid redirect URI"
**Cause**: Mismatch between Google Cloud Console and actual callback URL
**Solution**: 
1. Check your Supabase project URL
2. Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` to Google Cloud Console

### Issue 2: "Site URL not allowed"
**Cause**: Supabase Site URL doesn't match your local development URL
**Solution**: Set Site URL to `http://localhost:4002` in Supabase dashboard

### Issue 3: Environment variables not loading
**Cause**: `.env.local` file not in correct location or syntax error
**Solution**: 
1. Make sure `.env.local` is in project root (same level as `package.json`)
2. Restart your dev server after making changes
3. Check for syntax errors (no spaces around =)

### Issue 4: Wrong redirect URL in auth flow
**Cause**: Port mismatch between app and auth callback
**Solution**: Make sure both your app and OAuth are configured for the same port

## Test Authentication Step by Step

### 1. Basic Setup Test
```javascript
// Add to your login page console
import { createClient } from '@/lib/supabase'
const supabase = createClient()
console.log('Supabase client:', supabase)
```

### 2. Manual Auth Test
Try this in browser console on login page:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
console.log('Auth data:', data)
console.log('Auth error:', error)
```

### 3. Check Session After Auth
After successful auth, check in console:
```javascript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

## Expected Flow

### Correct Authentication Flow:
1. User clicks "Sign in with Google" → `/login`
2. Redirected to Google OAuth → `accounts.google.com`
3. User grants permission → Google redirects to Supabase
4. Supabase processes auth → Redirects to `/auth/callback?code=...`
5. Your callback route exchanges code for session → Redirects to `/playground`

### Your Current Flow (Error):
1. User clicks "Sign in with Google" → `/login`
2. Redirected to Google OAuth → `accounts.google.com`
3. User grants permission → Something fails
4. Redirected to → `/auth/auth-code-error`

## Quick Fix Commands

1. **Restart development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev -- -p 4002
   ```

2. **Check if environment file exists**:
   ```bash
   cat .env.local
   ```

3. **Create environment file from example**:
   ```bash
   cp .env.local.example .env.local
   # Then edit .env.local with your actual values
   ```

## Next Steps

1. **First**: Verify your `.env.local` file has the correct Supabase URL and key
2. **Second**: Check that redirect URLs match in both Supabase and Google Cloud Console
3. **Third**: Try authentication again and check the improved error page for specific error details
4. **Fourth**: Check browser console and server logs for any additional error messages

If you're still having issues, the improved error page will now show you the specific error details to help diagnose the problem further.