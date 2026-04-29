const express = require('express');
const path = require('path');
const cors = require('cors');
const homeController = require('./controllers/homeController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route per la homepage HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// API Routes per i dati
app.get('/api/homepage-data', homeController.getHomePageData);
app.get('/api/istat/stress-performance', homeController.getStressPerformanceData);

// Gestione 404
app.use((req, res) => {
    res.status(404).json({ error: 'Pagina non trovata' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server Benessere Digitale avviato su http://localhost:${PORT}`);
    console.log('💚 Homepage pronta con dati ISTAT!');
});