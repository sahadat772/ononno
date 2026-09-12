# Google OAuth (Supabase)

1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web)
   - Authorized JavaScript origins:
     - `https://ononno-two.vercel.app`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

2. **Supabase Dashboard** → Authentication → Providers → **Google** → Enable
   - Paste Client ID + Client Secret
   - Save

3. **URL Configuration**
   - Redirect URLs include: `https://ononno-two.vercel.app/auth/callback`

4. App uses:
   `signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback?next=/auth/redirect' } })`

5. First Google login: `/auth/redirect` bootstraps `profiles` if missing (default role student).
