const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URL = process.env.REACT_APP_SPOTIFY_REDIRECT_URL || process.env.SPOTIFY_REDIRECT_URL || `http://127.0.0.1:${PORT}/api/auth/spotify/callback`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
const PASSWORD_HASH = process.env.LOGIN_PASSWORD_HASH;
const DATA_DIR = path.join(__dirname, '..', '.data');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

if (!CLIENT_ID) throw new Error('Missing REACT_APP_SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_ID');

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false },
  })
);

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  } catch {
    return { spotify: null };
  }
}

function saveState(state) {
  ensureDataDir();
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(state, null, 2));
}

function getSpotifyState() {
  return loadState().spotify;
}

function setSpotifyState(spotify) {
  const state = loadState();
  state.spotify = spotify;
  saveState(state);
}

function authRequired(req, res, next) {
  if (req.session?.authenticated) return next();
  return res.status(401).json({ error: 'not_authenticated' });
}

function spotifyBasicAuth() {
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
}

async function refreshSpotifyToken() {
  const current = getSpotifyState();
  if (!current?.refresh_token || !CLIENT_SECRET) return null;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${spotifyBasicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: current.refresh_token,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));

  const next = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || current.refresh_token,
    expires_in: data.expires_in,
    updated_at: Date.now(),
  };
  setSpotifyState(next);
  return next;
}

async function getValidAccessToken() {
  let current = getSpotifyState();
  if (!current) return null;

  const expiresAt = (current.updated_at || 0) + (current.expires_in || 0) * 1000 - 60 * 1000;
  if (Date.now() < expiresAt) return current.access_token;

  current = await refreshSpotifyToken();
  return current?.access_token || null;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/session', (req, res) => res.json({ authenticated: !!req.session?.authenticated, spotifyConnected: !!getSpotifyState() }));

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!PASSWORD_HASH) return res.status(500).json({ error: 'password_not_configured' });
  if (!password || !bcrypt.compareSync(password, PASSWORD_HASH)) return res.status(401).json({ error: 'invalid_password' });
  req.session.authenticated = true;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/spotify/start', authRequired, (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.spotifyState = state;
  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scope: [
      'ugc-image-upload', 'streaming', 'user-read-playback-state', 'user-modify-playback-state',
      'user-read-currently-playing', 'playlist-read-private', 'playlist-modify-public',
      'playlist-modify-private', 'playlist-read-collaborative', 'user-follow-modify',
      'user-follow-read', 'user-read-playback-position', 'user-top-read',
      'user-read-recently-played', 'user-library-read', 'user-library-modify',
    ].join(' '),
    state,
  }).toString();
  res.redirect(url.toString());
});

app.get('/api/auth/spotify/callback', authRequired, async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.session.spotifyState) return res.status(400).send('Invalid Spotify auth state');
  if (!CLIENT_SECRET) return res.status(500).send('Missing SPOTIFY_CLIENT_SECRET');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${spotifyBasicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: REDIRECT_URL,
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).send(`Spotify token exchange failed: ${JSON.stringify(data)}`);

  setSpotifyState({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    updated_at: Date.now(),
  });
  req.session.spotifyConnected = true;
  req.session.spotifyState = null;
  res.redirect('/');
});

app.get('/api/spotify/token', authRequired, async (_req, res) => {
  const token = await getValidAccessToken();
  if (!token) return res.status(401).json({ error: 'spotify_not_connected' });
  res.json({ access_token: token });
});

app.get('/api/me', authRequired, async (_req, res) => {
  const token = await getValidAccessToken();
  if (!token) return res.status(401).json({ error: 'spotify_not_connected' });
  const spotifyRes = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
  const data = await spotifyRes.json();
  res.status(spotifyRes.status).json(data);
});

const buildDir = path.join(__dirname, '..', 'build');
const buildIndex = path.join(buildDir, 'index.html');

if (fs.existsSync(buildIndex)) {
  app.use(express.static(buildDir));
  app.use((_req, res) => res.sendFile(buildIndex));
} else {
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      mode: 'api-only',
      message: 'Build folder not found. Run npm run build for production UI or npm run termux for dev mode.',
    });
  });
}

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://0.0.0.0:${PORT}`));
