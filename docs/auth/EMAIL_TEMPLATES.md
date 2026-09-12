# ONONNO — Supabase Email templates

Supabase → Authentication → Email Templates

Redirect URLs:
- `https://ononno-two.vercel.app/auth/callback`
- `https://ononno-two.vercel.app/auth/confirmed`
- `https://ononno-two.vercel.app/auth/redirect`

## Confirm signup
Subject: `ONONNO — ইমেইল নিশ্চিত করুন`

```html
<h2>স্বাগতম ONONNO-তে 🎓</h2>
<p>হ্যালো {{ .Data.full_name }},</p>
<p>আপনার অ্যাকাউন্ট নিশ্চিত করতে:</p>
<p><a href="{{ .ConfirmationURL }}">ইমেইল নিশ্চিত করুন</a></p>
<p>— ONONNO · Learn · Explore · Achieve</p>
```

## Invite user
Subject: `ONONNO invite`

```html
<h2>ONONNO Invite</h2>
<p>আপনাকে invite করা হয়েছে।</p>
<p><a href="{{ .ConfirmationURL }}">Accept invite</a></p>
```

## Reset password
Subject: `ONONNO — পাসওয়ার্ড রিসেট`

```html
<h2>পাসওয়ার্ড রিসেট</h2>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
```
