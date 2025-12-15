const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  return res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Gaia lightweight server placeholder' });
});

app.listen(PORT, () => {
  console.log(`Gaia server placeholder listening on port ${PORT}`);
});
