const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const authRoutes = require('./auth');
const { requireAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================================ */
// MIDDLEWARE - FUNZIONI CHE SI INSERISCONO NEL FLUSSO RICHIESTA/RISPOSTA
/* ============================================ */

// Middleware 1: Body-parser per URL encoded (dati da form HTML tradizionali)
app.use(bodyParser.urlencoded({ extended: true }));
// extended: true permette di gestire dati annidati (es. oggetti dentro oggetti)
// Serve per leggere i dati inviati da un form HTML con method="POST"

// Middleware 2: Body-parser per JSON (dati da fetch/AJAX moderni)
app.use(bodyParser.json());
// Serve per leggere richieste con Content-Type: application/json
// Il client (frontend) invia JSON come { "username": "mario", "password": "1234" }
// body-parser lo converte in oggetto JavaScript accessibile con req.body

/* ============================================ */
// CONFIGURAZIONE DELLE SESSIONI (DEVE PRECEDERE LA PROTEZIONE DELLE ROTTE)
/* ============================================ */

app.use(session({
    secret: 'zengaming_segreto_sessione_12345',
    // Segreto usato per firmare il cookie di sessione (previene manomissioni)
    // dovrebbe essere una stringa complessa e segreta

    resave: false,
    // Se false: non salva la sessione se non è stata modificata
    // Ottimizza le prestazioni evitando salvataggi inutili

    saveUninitialized: false,
    // Se false: non salva sessioni vuote (utenti non autenticati)
    // Risparmia memoria sul server

    cookie: {
        secure: false, // true se usi HTTPS
        // Se true: il cookie viene inviato solo su connessioni HTTPS
        // In sviluppo (localhost) va messo false

        maxAge: 3600000 // 1 ora (valore in millisecondi)
        // Durata della sessione: 60 minuti * 60 secondi * 1000 millisecondi
        // Dopo 1 ora, l'utente deve rifare il login
    }
}));

// Middleware 2.5: Protezione delle pagine principali PRIMA di servire i file statici
// Intercettiamo le richieste per la home e le altre pagine per forzare il login
app.use((req, res, next) => {
    const protectedPaths = ['/', '/index.html', '/videogiochi', '/simulatori'];

    // Se la rotta è tra quelle protette, esegue il middleware di autenticazione
    if (protectedPaths.includes(req.path)) {
        return requireAuth(req, res, next);
    }

    // Altrimenti passa al prossimo middleware (es. express.static per CSS, JS, immagini, o /login.html)
    next();
});

// Middleware 3: File statici (CSS, immagini, JS client)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
// index: false impedisce a express.static di servire automaticamente index.html sulla rotta '/'
// Così la rotta '/' cade nel nostro app.get('/', ...) più in basso
// Serve automaticamente tutti gli altri file (CSS, immagini, JS client)

/* ============================================ */
// IMPORTA LE ROTTE DI AUTENTICAZIONE (POST /login)
/* ============================================ */

app.use('/', authRoutes);
// app.use monta le rotte da authRoutes sul percorso base '/'
// Quindi se in authRoutes c'è router.post('/login'), diventa accessibile su /login
// AuthRoutes gestisce la verifica di username e password

// Use API routes
app.use('/api', apiRoutes);

/* ============================================ */
// ROTTA PER MOSTRARE LA PAGINA DI LOGIN (GET)
/* ============================================ */

app.get('/login', (req, res) => {
    // app.get = risponde alle richieste HTTP GET sull'URL /login
    // (req, res) = request (richiesta), response (risposta)

    if (req.session.user) {
        // Controlla se esiste già una sessione attiva
        // req.session.user viene impostato da auth.js quando il login è corretto

        return res.redirect('/');
        // Se l'utente è già loggato, lo reindirizza direttamente alla homepage
        // return interrompe l'esecuzione della funzione
    }

    res.sendFile(path.join(__dirname, 'public', 'login.html'));
    // Invia il file HTML della pagina di login
    // path.join: costruisce il percorso corretto (funziona su tutti i SO)
    // __dirname: variabile di Node.js = percorso assoluto della cartella di questo script
});

/* ============================================ */
// ROTTA PER IL LOGOUT
/* ============================================ */

app.get('/logout', (req, res) => {
    // Rotta per effettuare il logout

    req.session.destroy((err) => {
        // destroy() elimina la sessione dal server
        // Callback eseguita quando la sessione è stata distrutta

        if (err) {
            console.error('Errore durante il logout:', err);
            // Se c'è errore, lo scrive nella console del server
        }

        res.redirect('/login');
        // In ogni caso (con o senza errore) reindirizza al login
    });
});

/* ============================================ */
// ROUTE PAGINE - PROTETTE DA AUTENTICAZIONE
/* ============================================ */

// Ora questa rotta è PROTETTA tramite l'interceptor sopra, ma aggiungiamo requireAuth per sicurezza
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// /videogiochi è una PAGINA PROTETTA: requireAuth verifica che l'utente sia loggato
// Se NON è loggato, viene reindirizzato automaticamente a /login
app.get('/videogiochi', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videogiochi.html'));
});

// /simulatori è una PAGINA PROTETTA: requireAuth verifica che l'utente sia loggato
// Se NON è loggato, viene reindirizzato automaticamente a /login
app.get('/simulatori', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simulatori.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
