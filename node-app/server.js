const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve the static files from the React app (Vite outputs to 'dist')
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure that all requests fall back to index.html for React Router to work
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend React server running on http://localhost:${PORT}`);
});
