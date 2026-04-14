# Termux setup

This is the easiest way to run it on your phone.

## 1) Install Termux packages

In Termux:

```bash
pkg update && pkg upgrade
pkg install nodejs git
```

## 2) Clone the repo

```bash
git clone https://github.com/francoborrelli/spotify-react-web-client
cd spotify-react-web-client
```

## 3) Create `.env`

Copy `.env.example` to `.env` and fill in:

- `REACT_APP_SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `REACT_APP_SPOTIFY_REDIRECT_URL`
- `LOGIN_PASSWORD_HASH`
- `SESSION_SECRET`

Example redirect URI when running on the phone:

- `http://127.0.0.1:3001/api/auth/spotify/callback`

If you want laptop access over Wi-Fi, use your phone’s LAN IP instead:

- `http://PHONE_IP:3001/api/auth/spotify/callback`

Then add that exact URL in the Spotify dashboard too.

## 4) Install dependencies

```bash
npm install
```

If `npm install` complains about the React tooling, run:

```bash
npm install --legacy-peer-deps
```

## 5) Build and run

```bash
npm run build
npm run serve
```

The app will listen on port `3001` and bind to `0.0.0.0`.

## 6) Open it

- On the phone: `http://127.0.0.1:3001`
- On the laptop over Wi-Fi: `http://PHONE_IP:3001`

## Flow

1. Open the site on the phone
2. Log in with the password
3. Authorize Spotify on the phone
4. Open the site on the laptop
5. Log in with the same password
6. You should now be using the same Spotify token stored on the phone server
