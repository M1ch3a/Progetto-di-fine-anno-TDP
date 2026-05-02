const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use API routes
app.use('/api', apiRoutes);

// Fallback to index.html for root if not served by static
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/videogiochi', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videogiochi.html'));
});

app.get('/simulatori', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simulatori.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
