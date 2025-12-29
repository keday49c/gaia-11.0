const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.UPDATE_SERVER_PORT || 5500;
const DIST = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(DIST)) {
  console.error('dist folder not found. Build the app first (npm run build:win)');
  process.exit(1);
}

const app = express();
app.use(express.static(DIST, { index: false }));

app.get('/', (req, res) => {
  res.send('Gaia update server. Serve files from ' + DIST);
});

app.listen(PORT, () => {
  console.log(`Update server running at http://localhost:${PORT}/`);
  console.log('Serving files from', DIST);
});
