require('dotenv').config({});
const express = require('express');
const app = express();

app.get('/status', (req, res) => {
  res.json({ message: 'works' });
});

app.listen(3000, () => {
  console.log(`> app running on port 3000`);
});
