const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Database setup (supports persistent disks via DB_PATH)
const dbFilePath = process.env.DB_PATH || path.join(__dirname, 'songs.db');
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at', dbFilePath);
  }
});

// Create/seed songs table if it doesn't exist
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

// API Routes

// Get all songs
app.get('/api/songs', (req, res) => {
  const query = 'SELECT * FROM songs ORDER BY created_at DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching songs:', err.message);
      res.status(500).json({ error: 'Failed to fetch songs' });
      return;
    }
    res.json(rows);
  });
});

// Get a specific song by ID
app.get('/api/songs/:id', (req, res) => {
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
});

// Add a new song
app.post('/api/songs', (req, res) => {
  const { song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link } = req.body;
  
  // Validate required fields
  if (!song_name || !artist_name || !lyrics_spanish || !youtube_link) {
    res.status(400).json({ error: 'Song name, artist name, Spanish lyrics, and YouTube link are required' });
    return;
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
app.get('/api/songs/search/:query', (req, res) => {
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
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
