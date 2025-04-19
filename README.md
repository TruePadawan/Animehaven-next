# <img src="https://user-images.githubusercontent.com/71678062/201470655-23cde758-d597-461e-82c8-37f32a2cc4c7.png" width="30" height="30"/> Animehaven

Animehaven provides an interface for viewing information on animes, creating and sharing lists of different animes,
having discussions with other users, etc.

![image](https://user-images.githubusercontent.com/71678062/205748954-423e5a49-2289-4ee3-9585-05fe40bdbec0.png)

## Local Setup

**Follow the official [guide](https://supabase.com/docs/guides/local-development) on how to setup a local instance of
Supabase.**  
**Create an OAuth Client using this [guide](https://supabase.com/docs/guides/auth/social-login/auth-google), you'll need
the client id and secret.**

### Environment Variables

Create a .env.local file and store the following environment variables  
`NEXT_PUBLIC_SUPABASE_URL` - REST API client URL provided by Supabase  
`NEXT_PUBLIC_SUPABASE_ANON_KEY` - Private key provided by Supabase  
`NEXT_PUBLIC_SITE_URL` - URL of the development server (e.g localhost:3000)  
`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client id  
`SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret

Run the `npx supabase start` command to start the local supabase instance (Docker should be running)  
Run the `npm run dev` command to start the local development server

## Tech Stack

- [React.js](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Material UI](https://mui.com/)
- [Jikan API](https://github.com/jikan-me/jikan)
