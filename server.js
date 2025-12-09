const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());        // IMPORTANT: allow React to access backend
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Example API route
app.get('/api/data', (req, res) => {
  res.json({
    message: "This is data from the Express server",
    time: new Date()
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
