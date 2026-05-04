/* ============================================ */
/* FILE: server.js (o app.js) - SERVER BACKEND */
/* ============================================ */

/* ============================================ */
// 1. IMPORT DEI MODULI NECESSARI
/* ============================================ */

// Importa il framework Express, usato per creare server web in Node.js
const express = require('express');
// Express è un framework minimalista per Node.js
// Semplifica la creazione di server, route, middleware, ecc.

// Importa express-session, serve per gestire le sessioni degli utenti (login, stato, ecc.)
const session = require('express-session');
// Le sessioni permettono di ricordare un utente tra diverse richieste HTTP
// Senza sessioni, il server "dimenticherebbe" l'utente dopo ogni richiesta

// Importa body-parser, utile per leggere i dati inviati dal client (es. form HTML, JSON)
const bodyParser = require('body-parser');
// Body-parser estrae i dati dal corpo della richiesta HTTP


// Importa il modulo path, usato per lavorare con percorsi di file e directory
const path = require('path');
// Path è un modulo nativo di Node.js
// Aiuta a creare percorsi che funzionano su tutti i sistemi operativi (Windows, Linux, Mac)

// Importa le rotte di autenticazione definite in un file locale chiamato "auth.js"
const authRoutes = require('./auth');
// Importa un modulo locale (creato da noi)
// ./ significa "nella stessa cartella"
// auth.js contiene le route per /login POST e la logica di verifica credenziali

/* ============================================ */
// 2. CREAZIONE DELL'APPLICAZIONE EXPRESS
/* ============================================ */

const app = express();
// Crea l'istanza dell'applicazione Express
// 'app' sarà l'oggetto principale che gestisce il server

const PORT = 3000;
// Definisce la porta su cui il server ascolterà
// 3000 è la porta standard di sviluppo per Express
// In produzione potrebbe essere 80 (HTTP) o 443 (HTTPS)

/* ============================================ */
// 3. MIDDLEWARE - FUNZIONI CHE SI INSERISCONO NEL FLUSSO RICHIESTA/RISPOSTA
/* ============================================ */

// Middleware 1: Body-parser per URL encoded (dati da form HTML tradizionali)
app.use(bodyParser.urlencoded({ extended: true }));
// extended: true permette di gestire dati annidati (es. oggetti dentro oggetti)
// Serve per leggere i dati inviati da un form HTML con method="POST"
// Esempio: username=mario.rossi&password=1234 diventa { username: 'mario.rossi', password: '1234' }

// Middleware 2: Body-parser per JSON (dati da fetch/AJAX moderni)
app.use(bodyParser.json());
// Serve per leggere richieste con Content-Type: application/json
// Il client (frontend) invia JSON come { "username": "mario", "password": "1234" }
// body-parser lo converte in oggetto JavaScript accessibile con req.body

// Middleware 3: File statici (CSS, immagini, JS client)
app.use(express.static('public'));
// Serve automaticamente tutti i file dalla cartella 'public'
// Esempio: richiesta /css/style.css -> cerca in public/css/style.css
// Esempio: richiesta /image/back-zen.png -> cerca in public/image/back-zen.png
// Non bisogna creare route specifiche per ogni file

/* ============================================ */
// 4. CONFIGURAZIONE DELLE SESSIONI
/* ============================================ */

app.use(session({
    secret: 'il_tuo_segreto_sessione_12345',
    // Segreto usato per firmare il cookie di sessione (previene manomissioni)
    // dovrebbe essere una stringa complessa e segreta
    // Non condividerla mai nel codice pubblico!
    
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
        // In produzione con HTTPS va messo true per sicurezza
        
        maxAge: 3600000 // 1 ora (valore in millisecondi)
        // Durata della sessione: 60 minuti * 60 secondi * 1000 millisecondi
        // Dopo 1 ora, l'utente deve rifare il login
    }
}));

/* ============================================ */
// 5. ROTTA PER MOSTRARE LA PAGINA DI LOGIN (GET)
/* ============================================ */

app.get('/login', (req, res) => {
    // app.get = risponde alle richieste HTTP GET sull'URL /login
    // (req, res) = request (richiesta), response (risposta)
    
    if (req.session.user) {
        // Controlla se esiste già una sessione attiva
        // req.session.user viene impostato da auth.js quando il login è corretto
        
        return res.redirect('/dashboard');
        // Se l'utente è già loggato, lo reindirizza direttamente alla dashboard
        // return interrompe l'esecuzione della funzione
    }
    
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
    // Invia il file HTML della pagina di login
    // path.join: costruisce il percorso corretto (funziona su tutti i SO)
    // __dirname: variabile di Node.js = percorso assoluto della cartella di questo script
    // Quindi cerca: /percorso/del/server/views/login.html
});

/* ============================================ */
// 6. IMPORTA LE ROTTE DI AUTENTICAZIONE (POST /login)
/* ============================================ */

app.use('/', authRoutes);
// app.use monta le rotte da authRoutes sul percorso base '/'
// Quindi se in authRoutes c'è app.post('/login'), diventa accessibile su /login
// AuthRoutes gestisce la verifica di username e password

/* ============================================ */
// 7. ROTTA PER LA DASHBOARD (PAGINA PROTETTA)
/* ============================================ */

app.get('/dashboard', (req, res) => {
    // Rotta per accedere alla dashboard (area riservata)
    
    if (!req.session.user) {
        // Se NON esiste una sessione attiva (utente NON loggato)
        
        return res.redirect('/login');
        // Reindirizza alla pagina di login
        // Impedisce l'accesso diretto a /dashboard senza login
    }
    
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
    // Se l'utente è loggato, mostra la dashboard
});

/* ============================================ */
// 8. ROTTA PER IL LOGOUT
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
// 9. AVVIO DEL SERVER
/* ============================================ */

app.listen(PORT, () => {
    // app.listen avvia il server in ascolto sulla porta specificata
    // Il secondo parametro è una callback eseguita quando il server è attivo
    
    console.log(`Server avviato su http://localhost:${PORT}`);
    console.log(`Vai su http://localhost:${PORT}/login`);
    // Messaggi nella console per confermare l'avvio
});