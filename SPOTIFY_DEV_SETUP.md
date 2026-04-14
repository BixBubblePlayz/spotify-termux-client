# Spotify Developer Page Setup

Use these settings when you create the Spotify app in the Spotify Developer Dashboard.

## 1) Create an app

Go to:

- https://developer.spotify.com/dashboard

Create a new app and fill in any name you want. The name does not matter much; it is just what Spotify shows you.

Recommended:

- App name: `Spotify Phone Client`
- App description: `Personal Spotify client for Termux`
- Website: leave blank or set your phone URL later

## 2) Redirect URI

Set the Redirect URI to the exact callback URL your phone server will use.

### If you are only testing on the phone itself

Use:

- `http://127.0.0.1:3001/api/auth/spotify/callback`

### If you want to open it from your laptop on the same Wi‑Fi

Use your phone’s LAN IP, for example:

- `http://192.168.1.25:3001/api/auth/spotify/callback`

Important rules:

- The URI must match exactly.
- Scheme, host, port, and path all have to be identical.
- If you change your phone IP, update the Spotify dashboard and `.env`.

## 3) Client ID and Client Secret

After saving the app, copy:

- Client ID → put into `REACT_APP_SPOTIFY_CLIENT_ID`
- Client Secret → put into `SPOTIFY_CLIENT_SECRET`

## 4) App settings to use in `.env`

Put these in your `.env` file:

```env
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REACT_APP_SPOTIFY_REDIRECT_URL=http://127.0.0.1:3001/api/auth/spotify/callback
LOGIN_PASSWORD_HASH=your_bcrypt_hash
SESSION_SECRET=some_long_random_string
PORT=3001
```

If you want laptop access over Wi‑Fi, replace the redirect URL with your phone IP.

## 5) Password hash

Generate the password hash with:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

Then paste the result into `LOGIN_PASSWORD_HASH`.

## 6) Spotify scopes used

The app requests the following scopes:

- `ugc-image-upload`
- `streaming`
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `playlist-read-private`
- `playlist-modify-public`
- `playlist-modify-private`
- `playlist-read-collaborative`
- `user-follow-modify`
- `user-follow-read`
- `user-read-playback-position`
- `user-top-read`
- `user-read-recently-played`
- `user-library-read`
- `user-library-modify`

## 7) Final flow

1. Open the site on the phone
2. Log in with the local password
3. Authorize Spotify
4. Open the site on the laptop
5. Log in with the same password
6. The server returns the Spotify token stored on the phone

## 8) If Spotify login fails

Check these first:

- Redirect URI matches exactly
- `SPOTIFY_CLIENT_SECRET` is correct
- `SESSION_SECRET` is set
- Phone is serving on the same host/port you configured
- You restarted Termux after editing `.env`
