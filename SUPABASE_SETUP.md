# Supabase Authentication Setup Guide

This guide will help you set up Google authentication with Supabase for the API Playground app.

## 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `api-playground`
   - **Database Password**: Generate a secure password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on the **Settings** icon in the sidebar
3. Click on **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://xyzabc123.supabase.co`)
   - **Project API keys** → **anon** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:
```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Google OAuth

### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **+ Create Credentials** > **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - For local development: `http://localhost:4002/auth/callback`

### Step 2: Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and click to configure
3. Enable the Google provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

## 5. Set Up Database Tables (Optional)

If you want to store user profiles or app-specific data:

```sql
-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Function to handle new user registration
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 6. Update Site URL

1. In Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Set your **Site URL** to:
   - For production: `https://your-domain.com`
   - For development: `http://localhost:4002`

## 7. Test the Authentication

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:4002/playground`
3. Click the "Sign in" button in the header
4. You should be redirected to `/login`
5. Click "Continue with Google"
6. Complete the Google OAuth flow
7. You should be redirected back to the playground with your user info displayed

## 8. Production Deployment

When deploying to production:

1. Update your environment variables in your hosting platform
2. Update the authorized redirect URIs in Google Cloud Console
3. Update the Site URL in Supabase dashboard
4. Make sure your domain is added to the authorized domains in Supabase

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**: Check that your redirect URI in Google Cloud Console matches exactly
2. **"Site URL not allowed"**: Update the Site URL in Supabase dashboard
3. **Environment variables not working**: Make sure `.env.local` is in your project root and restart your dev server

### Debug Steps:

1. Check browser console for errors
2. Check Supabase logs in dashboard > **Logs**
3. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

## Security Notes

- Never commit your `.env.local` file to version control
- Use different Supabase projects for development and production
- Regularly rotate your API keys
- Enable Row Level Security (RLS) on all tables that contain user data

## Next Steps

Once authentication is working, you can:

1. Store user's API collections in the database
2. Implement user-specific request history
3. Add team collaboration features
4. Sync settings across devices

---

🎉 Your API Playground now has Google authentication with Supabase!