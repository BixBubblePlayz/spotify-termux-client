# Phone + laptop setup

This version uses a small Node/Express server to hold the Spotify OAuth token server-side and a password login to unlock the site.

## What you need

- Node.js on the phone, or a runtime like Termux
- A Spotify Developer app
- A Spotify Premium account for playback

## 1) Configure Spotify

In the Spotify Developer Dashboard, add a redirect URI that your phone can actually reach, for example:

- `http://PHONE_IP:3001/api/auth/spotify/callback`
- or your tunnel URL, like `https://xxxxx.ngrok-free.app/api/auth/spotify/callback`

Important: the redirect URI must match exactly.

## 2) Create `.env`

Copy `.env.example` to `.env` and fill in:

- `REACT_APP_SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `REACT_APP_SPOTIFY_REDIRECT_URL`
- `LOGIN_PASSWORD_HASH`
- `SESSION_SECRET`

To make the password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## 3) Install and run

```bash
npm install
npm run build
npm run serve
```

If you want the React dev server instead of the built app, run:

```bash
npm start
```

and keep the API server on port 3001.

## 4) Flow

1. Open the site on the phone
2. Log in with the password
3. Connect Spotify on the phone
4. Open the site on the laptop
5. Log in with the same password
6. The laptop session will use the Spotify token already stored on the server

## Notes

- This is intentionally single-user / shared-token style.
- If you want per-user accounts later, the backend should store separate Spotify tokens per password account.
