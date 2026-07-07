# Supabase setup for SchemeMatch AI

## 1) Create a Supabase project
- Go to https://supabase.com
- Create a new project
- Wait for the project to finish provisioning

## 2) Get your credentials
In the Supabase dashboard, open Settings > API and copy:
- Project URL
- Anon public key

## 3) Add them to the app
Open the project root and update the environment file:
- .env

Use these keys:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4) Apply the database schema
In Supabase Studio, open SQL Editor and run the contents of:
- src/supabase/schema.sql

## 5) Enable authentication (recommended)
In Authentication > Settings, enable at least:
- Email/Password

Also set the site URL for local development:
- http://localhost:5173

## 6) Restart the app
Run:
```bash
npm run dev
```

Once the credentials are present, the app will use Supabase instead of mock/local-only storage.
