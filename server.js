const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const SHEETS_MODE = false;
const PG_CONNECTION_STRING = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || '';
const PG_SSL = String(process.env.PG_SSL || 'true').toLowerCase() !== 'false';
const POSTGRES_MODE = !!PG_CONNECTION_STRING && !SHEETS_MODE;

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

// Database setup (supports Postgres via DATABASE_URL; falls back to SQLite)
let db = null;
let pgPool = null;
{
  if(POSTGRES_MODE){
    try{
      pgPool = new Pool({ connectionString: PG_CONNECTION_STRING, ssl: PG_SSL ? { rejectUnauthorized: false } : false });
      console.log('Connected to PostgreSQL');
    }catch(e){
      console.error('Failed to initialize PostgreSQL pool:', e && e.message);
    }
  } else {
    const dbFilePath = process.env.DB_PATH || path.join(__dirname, 'songs.db');
    db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to the SQLite database at', dbFilePath);
      }
    });
  }
}

// Create/seed songs table if it doesn't exist
  if(pgPool){
    (async () => {
      try{
        const { rows: userRows } = await pgPool.query('SELECT current_user as u');
        const currentUser = (userRows && userRows[0] && userRows[0].u) || undefined;
        if(currentUser){
          await pgPool.query(`CREATE SCHEMA IF NOT EXISTS "${currentUser}" AUTHORIZATION CURRENT_USER`);
          await pgPool.query(`SET search_path TO "${currentUser}", public`);
        }
        await pgPool.query(`CREATE TABLE IF NOT EXISTS music_entries (
          id SERIAL PRIMARY KEY,
          song_name TEXT NOT NULL,
          artist_name TEXT NOT NULL,
          lyrics_spanish TEXT NOT NULL,
          lyrics_english TEXT,
          lyrics_german TEXT,
          youtube_link TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )`);
        console.log('Ensured PostgreSQL schema');
      }catch(e){
        console.error('Failed to ensure PostgreSQL schema:', e && e.message);
      }
    })();
  } else if(db){
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


// API Routes

// Get all songs
app.get('/api/songs', async (req, res) => {
  try{
    if(pgPool){
      const { rows } = await pgPool.query('SELECT * FROM music_entries ORDER BY created_at DESC');
      return res.json(rows);
    }
    const query = 'SELECT * FROM music_entries ORDER BY created_at DESC';
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
    if(pgPool){
      const { rows } = await pgPool.query('SELECT * FROM music_entries WHERE id = $1', [Number(req.params.id)]);
      const row = rows[0];
      if(!row) return res.status(404).json({ error: 'Song not found' });
      return res.json(row);
    }
    const query = 'SELECT * FROM music_entries WHERE id = ?';
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
  const { song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link } = req.body;
  
  // Validate required fields
  if (!song_name || !artist_name || !lyrics_spanish || !youtube_link) {
    res.status(400).json({ error: 'Song name, artist name, Spanish lyrics, and YouTube link are required' });
    return;
  }
  if(pgPool){
    try{
      const { rows } = await pgPool.query(
        'INSERT INTO music_entries (song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [song_name, artist_name, lyrics_spanish, lyrics_english || null, lyrics_german || null, youtube_link]
      );
      return res.status(201).json({
        id: rows[0] && rows[0].id,
        song_name,
        artist_name,
        lyrics_spanish,
        lyrics_english,
        lyrics_german,
        youtube_link,
        message: 'Song added successfully'
      });
    }catch(e){
      console.error('Error adding song (Postgres):', e && e.message);
      return res.status(500).json({ error: 'Failed to add song' });
    }
  }
  const query = 'INSERT INTO music_entries (song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link) VALUES (?, ?, ?, ?, ?, ?)';
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
app.put('/api/songs/:id', async (req, res) => {
  const { song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link } = req.body;
  const songId = req.params.id;
  
  if (!song_name || !artist_name || !lyrics_spanish || !youtube_link) {
    res.status(400).json({ error: 'Song name, artist name, Spanish lyrics, and YouTube link are required' });
    return;
  }
  
  if(pgPool){
    try{
      const result = await pgPool.query(
        'UPDATE music_entries SET song_name = $1, artist_name = $2, lyrics_spanish = $3, lyrics_english = $4, lyrics_german = $5, youtube_link = $6 WHERE id = $7',
        [song_name, artist_name, lyrics_spanish, lyrics_english || null, lyrics_german || null, youtube_link, Number(songId)]
      );
      if(result.rowCount === 0){ return res.status(404).json({ error: 'Song not found' }); }
      return res.json({ 
        id: Number(songId),
        song_name,
        artist_name,
        lyrics_spanish,
        lyrics_english,
        lyrics_german,
        youtube_link,
        message: 'Song updated successfully'
      });
    }catch(e){
      console.error('Error updating song (Postgres):', e && e.message);
      return res.status(500).json({ error: 'Failed to update song' });
    }
  }
  const query = 'UPDATE music_entries SET song_name = ?, artist_name = ?, lyrics_spanish = ?, lyrics_english = ?, lyrics_german = ?, youtube_link = ? WHERE id = ?';
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
app.delete('/api/songs/:id', async (req, res) => {
  if(pgPool){
    try{
      const result = await pgPool.query('DELETE FROM music_entries WHERE id = $1', [Number(req.params.id)]);
      if(result.rowCount === 0){ return res.status(404).json({ error: 'Song not found' }); }
      return res.json({ message: 'Song deleted successfully' });
    }catch(e){
      console.error('Error deleting song (Postgres):', e && e.message);
      return res.status(500).json({ error: 'Failed to delete song' });
    }
  }
  const query = 'DELETE FROM music_entries WHERE id = ?';
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
    if(pgPool){
      const searchQuery = `%${req.params.query}%`;
      const { rows } = await pgPool.query('SELECT * FROM music_entries WHERE song_name ILIKE $1 OR artist_name ILIKE $1 ORDER BY created_at DESC', [searchQuery]);
      return res.json(rows);
    }
    const searchQuery = `%${req.params.query}%`;
    const query = 'SELECT * FROM music_entries WHERE song_name LIKE ? OR artist_name LIKE ? ORDER BY created_at DESC';
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
  if(POSTGRES_MODE){
    console.log('PostgreSQL mode enabled. Using DATABASE_URL connection');
  } else {
    console.log(`Visit http://localhost:${PORT} to view the app`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try{
    if(pgPool){
      await pgPool.end();
      console.log('PostgreSQL pool closed.');
    }
  }catch(e){
    console.error('Error closing Postgres pool:', e && e.message);
  }
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
