// Importa il framework Express, usato per creare server web in Node.js
const express = require('express');

// Importa express-session, serve per gestire le sessioni degli utenti (login, stato, ecc.)
const session = require('express-session');

// Importa body-parser, utile per leggere i dati inviati dal client (es. form HTML, JSON)
const bodyParser = require('body-parser');

// Importa il modulo path, usato per lavorare con percorsi di file e directory
const path = require('path');

// Importa le rotte di autenticazione definite in un file locale chiamato "auth.js"
const authRoutes = require('./auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Configurazione sessione
app.use(session({
    secret: 'il_tuo_segreto_sessione_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Metti true se usi HTTPS
        maxAge: 3600000 // 1 ora
    }
}));

// Imposta la directory delle views
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

// Rotta per la pagina di login
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Usa le routes di autenticazione
app.use('/', authRoutes);

// Rotta per la dashboard (protetta)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Rotta per il logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
        }
        res.redirect('/login');
    });
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    console.log(`Vai su http://localhost:${PORT}/login`);
});