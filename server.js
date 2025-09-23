const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SHEET_GID = process.env.GOOGLE_SHEET_GID || '';
const SHEETS_WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL || '';
const SHEETS_MODE = !!SHEET_ID;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Auth middleware (for admin.html)
function basicAuth(req, res, next){
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Basic ') ? header.slice(6) : '';
  let credentials = '';
  try {
    credentials = Buffer.from(token, 'base64').toString('utf8');
  } catch (e) {
    // noop
  }
  const sep = credentials.indexOf(':');
  const user = sep >= 0 ? credentials.slice(0, sep) : '';
  const pass = sep >= 0 ? credentials.slice(sep + 1) : '';
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASS || 'admin';
  if(user === expectedUser && pass === expectedPass){
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Authentication required');
}

// Protect admin page explicitly BEFORE static serving
app.get('/admin.html', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Database setup (supports persistent disks via DB_PATH) - disabled when Sheets mode is on
let db = null;
if(!SHEETS_MODE){
  const dbFilePath = process.env.DB_PATH || path.join(__dirname, 'songs.db');
  db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the SQLite database at', dbFilePath);
    }
  });
}

// Create/seed songs table if it doesn't exist
if(!SHEETS_MODE && db){
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      lyrics_spanish TEXT NOT NULL,
      lyrics_english TEXT,
      lyrics_german TEXT,
      youtube_link TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // Optional auto-seed on first boot if ENABLE_AUTOINIT is set (e.g., on free hosts without shell)
    if (String(process.env.ENABLE_AUTOINIT || '').toLowerCase() === 'true') {
      try {
        const { seedWithDb } = require('./init-database');
        seedWithDb(db, () => console.log('Auto-initialization complete.'));
      } catch (e) {
        console.warn('Auto-initialization skipped:', e && e.message);
      }
    }
  });
}

// Sheets cache and helpers
let sheetsCache = { data: [], lastFetchMs: 0 };
const SHEETS_CACHE_TTL_MS = Number(process.env.SHEETS_CACHE_TTL_MS || 60_000);

function buildPublishedCsvUrl(sheetId, gid){
  // Requires File -> Share -> Anyone with the link, and File -> Share -> Publish to the web (CSV)
  const suffix = gid ? `&gid=${encodeURIComponent(gid)}` : '';
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv${suffix}`;
}

function parseCsv(text){
  // Simple CSV parser supporting quoted commas and newlines
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    if(inQuotes){
      if(ch === '"'){
        const next = text[i+1];
        if(next === '"'){ cur += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else {
      if(ch === '"') { inQuotes = true; }
      else if(ch === ','){ row.push(cur); cur = ''; }
      else if(ch === '\n'){ row.push(cur); rows.push(row); row = []; cur = ''; }
      else if(ch === '\r'){ /* ignore */ }
      else { cur += ch; }
    }
  }
  // flush
  if(cur.length > 0 || row.length > 0){ row.push(cur); rows.push(row); }
  return rows;
}

function mapSheetRowToSong(row, header){
  const get = (name) => {
    const idx = header.findIndex(h => String(h || '').trim().toLowerCase() === String(name).toLowerCase());
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };
  const idRaw = get('id') || get('ID') || '';
  const id = idRaw ? Number(idRaw) : undefined;
  return {
    id: id || undefined,
    song_name: get('song_name') || get('Song Name') || get('song') || '',
    artist_name: get('artist_name') || get('Artist Name') || get('artist') || '',
    lyrics_spanish: get('lyrics_spanish') || get('Spanish') || get('spanish') || '',
    lyrics_english: get('lyrics_english') || get('English') || get('english') || '',
    lyrics_german: get('lyrics_german') || get('German') || get('german') || '',
    youtube_link: get('youtube_link') || get('YouTube') || get('youtube') || '',
    created_at: get('created_at') || get('createdAt') || new Date().toISOString()
  };
}

async function fetchSongsFromSheet(){
  if(!SHEETS_MODE) return [];
  const now = Date.now();
  if(now - sheetsCache.lastFetchMs < SHEETS_CACHE_TTL_MS && sheetsCache.data.length){
    return sheetsCache.data;
  }
  const url = buildPublishedCsvUrl(SHEET_ID, SHEET_GID);
  const res = await fetch(url, { headers: { 'Accept': 'text/csv' } });
  if(!res.ok){
    throw new Error(`Sheets fetch failed: ${res.status}`);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  if(!rows.length) return [];
  const header = rows[0];
  const dataRows = rows.slice(1).filter(r => r && r.some(c => (c||'').trim().length));
  const mapped = dataRows.map(r => mapSheetRowToSong(r, header)).filter(s => s.song_name && s.artist_name && s.lyrics_spanish && s.youtube_link);
  // Auto-assign incremental ids if missing
  let nextId = 1;
  mapped.forEach(s => { if(typeof s.id !== 'number'){ s.id = nextId++; } else { nextId = Math.max(nextId, s.id + 1); } });
  sheetsCache = { data: mapped, lastFetchMs: now };
  return mapped;
}

// API Routes

// Get all songs
app.get('/api/songs', async (req, res) => {
  try{
    if(SHEETS_MODE){
      const rows = await fetchSongsFromSheet();
      return res.json(rows);
    }
    const query = 'SELECT * FROM songs ORDER BY created_at DESC';
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching songs:', err.message);
        res.status(500).json({ error: 'Failed to fetch songs' });
        return;
      }
      res.json(rows);
    });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Get a specific song by ID
app.get('/api/songs/:id', async (req, res) => {
  try{
    if(SHEETS_MODE){
      const rows = await fetchSongsFromSheet();
      const id = Number(req.params.id);
      const found = rows.find(r => Number(r.id) === id);
      if(!found) return res.status(404).json({ error: 'Song not found' });
      return res.json(found);
    }
    const query = 'SELECT * FROM songs WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching song:', err.message);
        res.status(500).json({ error: 'Failed to fetch song' });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Song not found' });
        return;
      }
      res.json(row);
    });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// Add a new song
app.post('/api/songs', async (req, res) => {
  if(SHEETS_MODE && !SHEETS_WEBAPP_URL){
    return res.status(405).json({ error: 'Read-only: Google Sheets mode enabled (no write webhook configured)' });
  }
  const { song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link } = req.body;
  
  // Validate required fields
  if (!song_name || !artist_name || !lyrics_spanish || !youtube_link) {
    res.status(400).json({ error: 'Song name, artist name, Spanish lyrics, and YouTube link are required' });
    return;
  }
  if(SHEETS_MODE && SHEETS_WEBAPP_URL){
    try{
      const payload = { song_name, artist_name, lyrics_spanish, lyrics_english: lyrics_english || '', lyrics_german: lyrics_german || '', youtube_link };
      const resp = await fetch(SHEETS_WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!resp.ok){
        const text = await resp.text().catch(()=> '');
        return res.status(502).json({ error: 'Failed to append to Google Sheet', details: text.slice(0, 400) });
      }
      // Invalidate cache so next GET sees the new row
      sheetsCache = { data: [], lastFetchMs: 0 };
      const result = await resp.json().catch(()=>({ ok:true }));
      return res.status(201).json({
        id: result && result.id ? result.id : undefined,
        song_name,
        artist_name,
        lyrics_spanish,
        lyrics_english,
        lyrics_german,
        youtube_link,
        message: 'Song added successfully (Sheets)'
      });
    }catch(e){
      console.error('Sheets write failed:', e && e.message);
      return res.status(502).json({ error: 'Failed to write to Google Sheet' });
    }
  }
  const query = 'INSERT INTO songs (song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.run(query, [song_name, artist_name, lyrics_spanish, lyrics_english || null, lyrics_german || null, youtube_link], function(err) {
    if (err) {
      console.error('Error adding song:', err.message);
      res.status(500).json({ error: 'Failed to add song' });
      return;
    }
    res.status(201).json({ 
      id: this.lastID,
      song_name,
      artist_name,
      lyrics_spanish,
      lyrics_english,
      lyrics_german,
      youtube_link,
      message: 'Song added successfully'
    });
  });
});

// Update a song
app.put('/api/songs/:id', (req, res) => {
  if(SHEETS_MODE){ return res.status(405).json({ error: 'Read-only: Google Sheets mode enabled' }); }
  const { song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link } = req.body;
  const songId = req.params.id;
  
  // Validate required fields
  if (!song_name || !artist_name || !lyrics_spanish || !youtube_link) {
    res.status(400).json({ error: 'Song name, artist name, Spanish lyrics, and YouTube link are required' });
    return;
  }
  
  const query = 'UPDATE songs SET song_name = ?, artist_name = ?, lyrics_spanish = ?, lyrics_english = ?, lyrics_german = ?, youtube_link = ? WHERE id = ?';
  
  db.run(query, [song_name, artist_name, lyrics_spanish, lyrics_english || null, lyrics_german || null, youtube_link, songId], function(err) {
    if (err) {
      console.error('Error updating song:', err.message);
      res.status(500).json({ error: 'Failed to update song' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json({ 
      id: songId,
      song_name,
      artist_name,
      lyrics_spanish,
      lyrics_english,
      lyrics_german,
      youtube_link,
      message: 'Song updated successfully'
    });
  });
});

// Delete a song
app.delete('/api/songs/:id', (req, res) => {
  if(SHEETS_MODE){ return res.status(405).json({ error: 'Read-only: Google Sheets mode enabled' }); }
  const query = 'DELETE FROM songs WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting song:', err.message);
      res.status(500).json({ error: 'Failed to delete song' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json({ message: 'Song deleted successfully' });
  });
});

// Search songs by artist or song name
app.get('/api/songs/search/:query', async (req, res) => {
  try{
    if(SHEETS_MODE){
      const q = String(req.params.query || '').toLowerCase();
      const rows = await fetchSongsFromSheet();
      const filtered = rows.filter(r => (r.song_name||'').toLowerCase().includes(q) || (r.artist_name||'').toLowerCase().includes(q));
      return res.json(filtered);
    }
    const searchQuery = `%${req.params.query}%`;
    const query = 'SELECT * FROM songs WHERE song_name LIKE ? OR artist_name LIKE ? ORDER BY created_at DESC';
    db.all(query, [searchQuery, searchQuery], (err, rows) => {
      if (err) {
        console.error('Error searching songs:', err.message);
        res.status(500).json({ error: 'Failed to search songs' });
        return;
      }
      res.json(rows);
    });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if(SHEETS_MODE){
    console.log('Google Sheets mode enabled. Sheet ID:', SHEET_ID, SHEET_GID ? `(gid=${SHEET_GID})` : '');
  } else {
    console.log(`Visit http://localhost:${PORT} to view the app`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  if(db){
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
