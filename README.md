# Language Music App Backend

A Node.js backend with SQLite (default) or PostgreSQL (Filess.io) for managing Spanish songs with lyrics and YouTube links.

## Features

- **SQLite Database**: Lightweight, file-based database
- **PostgreSQL (Filess.io) Mode**: Use a hosted PostgreSQL via Filess.io
- **REST API**: Full CRUD operations for songs
- **Search Functionality**: Search songs by artist or song name
- **Admin Interface**: Web-based admin panel for managing songs
- **Sample Data**: Pre-populated with songs from your existing app

## Database Schema

The `songs` table contains:
- `id` (INTEGER PRIMARY KEY): Unique identifier
- `song_name` (TEXT): Name of the song
- `artist_name` (TEXT): Name of the artist
- `lyrics_spanish` (TEXT): Spanish lyrics
- `youtube_link` (TEXT): YouTube video URL
- `created_at` (DATETIME): Timestamp when song was added

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize the database** (optional - will be done automatically on first run):
   ```bash
   npm run init-db
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Using PostgreSQL on Filess.io (Recommended for writes)

You can run this app against a managed PostgreSQL from Filess.io. When a PostgreSQL connection URL is provided, the server switches from SQLite to PostgreSQL automatically.

1. Create a PostgreSQL database on Filess.io.
2. Get the connection URL (e.g., `postgres://USER:PASSWORD@HOST:PORT/DBNAME`).
3. Set the following environment variables before starting the server:
   ```bash
   export DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DBNAME"
   # Optional: disable SSL if your provider requires plain connection (default is SSL on)
   export PG_SSL=true
   npm start
   ```

Behavior:
- When `DATABASE_URL` is set, the app uses PostgreSQL.
- On startup, it auto-creates the `songs` table if it doesn't exist.
- All CRUD endpoints operate against PostgreSQL.

Schema (PostgreSQL):
```sql
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  song_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  lyrics_spanish TEXT NOT NULL,
  lyrics_english TEXT,
  lyrics_german TEXT,
  youtube_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Songs

- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get a specific song
- `POST /api/songs` - Add a new song
- `PUT /api/songs/:id` - Update a song
- `DELETE /api/songs/:id` - Delete a song
- `GET /api/songs/search/:query` - Search songs

### Example API Usage

```javascript
// Get all songs
fetch('/api/songs')
  .then(response => response.json())
  .then(songs => console.log(songs));

// Add a new song
fetch('/api/songs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    song_name: "New Song",
    artist_name: "Artist Name",
    lyrics_spanish: "Spanish lyrics here...",
    youtube_link: "https://www.youtube.com/watch?v=..."
  })
});

// Search songs
fetch('/api/songs/search/shakira')
  .then(response => response.json())
  .then(results => console.log(results));
```

## Admin Interface

Visit `http://localhost:3000/admin.html` to access the admin interface where you can:

- Add new songs
- Edit existing songs
- Delete songs
- Search through songs
- View all song details

## Files Structure

```
├── server.js              # Main server file
├── init-database.js       # Database initialization script
├── admin.html             # Admin interface
├── index.html             # Main app (your existing file)
├── package.json           # Dependencies and scripts
├── songs.db               # SQLite database (created automatically)
└── README.md              # This file
```

## Sample Data

The database comes pre-populated with 4 songs from your existing app:

1. **Shakira** - "Pies Descalzos, Sueños Blancos"
2. **Bad Bunny** - "DtMF"
3. **Tuna Decana de Madrid** - "Canta y No Llores"
4. **TONY SOPRANOV BAND** - "Las Aventuras de Ivan"

## Development

- The server runs on port 3000 by default
- Database file (`songs.db`) is created automatically
- CORS is enabled for cross-origin requests
- Static files are served from the root directory

## Deployment

- When hosted on Netlify (domain ends with `netlify.app`), the frontend automatically targets the backend at `https://language-music-app.onrender.com`. No query parameters are required.
- You can override the backend once using a query parameter, which is then persisted in `localStorage`:
  - Example: `https://<your-netlify-site>.netlify.app/?backend=https://your-backend.example.com`
- To reset to defaults, clear the `backend_origin` key in your browser `localStorage` (or clear site data) and reload.

## Next Steps

To integrate this backend with your existing frontend:

1. Replace the hardcoded song data in `index.html` with API calls
2. Add functionality to load songs dynamically from the database
3. Consider adding user authentication for the admin interface
4. Add more advanced search and filtering options

## Troubleshooting

- **Port already in use**: Change the PORT environment variable or kill the process using the port
- **Database errors**: Delete `songs.db` and restart the server to recreate it
- **CORS issues**: The server includes CORS middleware, but check browser console for any issues

## License

MIT License
