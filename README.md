# Language Music App Backend

A Node.js backend with SQLite database for managing Spanish songs with lyrics and YouTube links.

## Features

- **SQLite Database**: Lightweight, file-based database
- **Google Sheets Mode (Read-only)**: Load songs directly from a published Google Sheet
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

## Using Google Sheets as Data Source (Read-only)

You can serve songs from a Google Sheet instead of SQLite. This mode makes GET endpoints read from the sheet and disables write endpoints (POST/PUT/DELETE return 405).

1. Publish your sheet to the web in CSV format and ensure it’s accessible:
   - In Sheets: File → Share → Share with others → set to “Anyone with the link can view”.
   - File → Share → Publish to web → Entire sheet (or specific tab) → CSV.
2. Note your Sheet ID (the long ID in the sheet URL) and optional tab gid.
3. Set environment variables before starting the server:
   ```bash
   export GOOGLE_SHEET_ID="<your_sheet_id>"
   # Optional: if you want a specific tab
   export GOOGLE_SHEET_GID="<gid_number>"
   # Optional cache TTL (ms), default 60000
   export SHEETS_CACHE_TTL_MS=60000
   npm start
   ```

Expected column headers (case-insensitive, flexible aliases in parentheses):
- `id` (optional)
- `song_name` ("Song Name")
- `artist_name` ("Artist Name")
- `lyrics_spanish` ("Spanish")
- `lyrics_english` (optional, "English")
- `lyrics_german` (optional, "German")
- `youtube_link` ("YouTube")
- `created_at` (optional)

Notes:
- If `id` is missing, incremental IDs are assigned at runtime.
- Data is cached in-memory for `SHEETS_CACHE_TTL_MS`.
- Admin UI will be read-only effectively; write actions will error with 405.

### Enabling Writes to Google Sheets (Admin add/update)

To allow `admin.html` to add songs directly to the Google Sheet, deploy a Google Apps Script Web App that appends rows:

1. In Google Drive: New → Apps Script. Paste this code and deploy:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID';
   const TAB_NAME = 'Sheet1'; // or your tab name
   function doPost(e){
     try{
       const body = JSON.parse(e.postData.contents || '{}');
       const { song_name, artist_name, lyrics_spanish, lyrics_english = '', lyrics_german = '', youtube_link } = body;
       if(!song_name || !artist_name || !lyrics_spanish || !youtube_link){
         return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'missing fields' })).setMimeType(ContentService.MimeType.JSON);
       }
       const ss = SpreadsheetApp.openById(SHEET_ID);
       const sh = ss.getSheetByName(TAB_NAME) || ss.getSheets()[0];
       const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(h => String(h||'').toLowerCase());
       const map = (name) => header.indexOf(name);
       const row = new Array(header.length).fill('');
       const set = (name, val) => { const i = map(name); if(i>=0) row[i] = val; };
       set('song_name', song_name); set('artist_name', artist_name);
       set('lyrics_spanish', lyrics_spanish); set('lyrics_english', lyrics_english); set('lyrics_german', lyrics_german);
       set('youtube_link', youtube_link); set('created_at', new Date().toISOString());
       sh.appendRow(row);
       return ContentService.createTextOutput(JSON.stringify({ ok:true })).setMimeType(ContentService.MimeType.JSON);
     }catch(err){
       return ContentService.createTextOutput(JSON.stringify({ ok:false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```
2. Deploy → New deployment → Type: Web app → Execute as: Me → Who has access: Anyone.
3. Copy the Web App URL and set it as:
   ```bash
   export GOOGLE_SHEETS_WEBAPP_URL="https://script.google.com/.../exec"
   ```

Now, when `GOOGLE_SHEET_ID` and `GOOGLE_SHEETS_WEBAPP_URL` are set, `POST /api/songs` will forward to your Web App and invalidate the cache.

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
