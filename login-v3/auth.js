/* ============================================ */
/* FILE: auth.js - GESTIONE AUTENTICAZIONE */
/* ============================================ */
// Questo file contiene tutte le route e la logica per l'autenticazione
// Viene importato dal server principale con require('./auth')

/* ============================================ */
// 1. IMPORT DEI MODULI NECESSARI
/* ============================================ */

const express = require('express');
// Importa Express per creare le route (gestisce le richieste HTTP)

const fs = require('fs');
// Importa File System (modulo nativo di Node.js)
// Serve per leggere e scrivere file sul server
// In questo caso, legge il file users.json che contiene gli utenti

const path = require('path');
// Importa il modulo path (nativo Node.js)
// Per costruire percorsi di file in modo cross-platform

const bcrypt = require('bcryptjs');
// Importa bcryptjs per l'hashing delle password (sicurezza)
// bcryptjs è una libreria che trasforma le password in stringhe crittografate
// NOTA: nel codice attuale non viene ancora usato, ma è importato per essere implementato

/* ============================================ */
// 2. CREAZIONE DEL ROUTER
/* ============================================ */

const router = express.Router();
// Crea un router separato (un mini-app Express)
// I router servono per organizzare il codice in moduli
// Tutte le route definite qui avranno prefisso opzionale (nel server: app.use('/', authRoutes))

/* ============================================ */
// 3. PERCORSO DEL DATABASE UTENTI
/* ============================================ */

const USERS_DB_PATH = path.join(__dirname, 'data', 'users.json');
// Costante che contiene il percorso completo del file users.json
// __dirname: cartella dove si trova questo script (auth.js)
// Quindi cerca: /percorso/auth.js/../data/users.json
// Questo file JSON funge da "database" (semplice file di testo)

/* ============================================ */
// 4. FUNZIONE PER LEGGERE GLI UTENTI
/* ============================================ */

function getUsers() {
    // Funzione che legge il file JSON e restituisce l'array degli utenti
    
    try {
        // try: tenta di eseguire il codice, se fallisce va in catch
        
        const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
        // readFileSync: LEGGE il file in modo SINCRONO (blocca l'esecuzione)
        // 'utf8': specifica la codifica del testo (legge come stringa)
        
        return JSON.parse(data).users;
        // JSON.parse: converte la stringa JSON in un oggetto JavaScript
        // .users: estrae la proprietà 'users' (l'array di utenti)
        
    } catch (error) {
        // catch: si esegue se c'è un errore (es. file non trovato)
        
        console.error('Errore nella lettura del database:', error);
        // Stampa l'errore nella console del server
        
        return [];
        // Restituisce un array vuoto (fallback sicuro)
    }
}

/* ============================================ */
// 5. FUNZIONE PER CERCARE UN UTENTE PER USERNAME
/* ============================================ */

function findUserByUsername(username) {
    // Riceve uno username come parametro
    // Restituisce l'utente se trovato, altrimenti undefined
    
    const users = getUsers();
    // Chiama la funzione per ottenere tutti gli utenti
    
    return users.find(user => user.username === username);
    // .find(): metodo degli array che restituisce il primo elemento che soddisfa la condizione
    // Cerca nell'array un utente il cui username corrisponde a quello passato
    // Se non trova, restituisce undefined
}

/* ============================================ */
// 6. ROTTA PER IL LOGIN (POST)
/* ============================================ */

router.post('/login', (req, res) => {
    // router.post: risponde alle richieste HTTP POST su /login
    // Il client (frontend) invia username e password nel corpo della richiesta
    
    const { username, password } = req.body;
    // Destrutturazione dell'oggetto req.body
    // Estrae le proprietà username e password
    // req.body viene popolato da body-parser (nel server principale)
    
    // ============================================ //
    // VALIDAZIONE INPUT - Controllo campi vuoti
    // ============================================ //
    if (!username || !password) {
        // Se username è vuoto OPPURE password è vuota
        
        return res.status(400).json({ 
            // status(400): Bad Request - errore del client
            // return: interrompe l'esecuzione della funzione
            
            success: false, 
            message: 'Inserisci username e password' 
            // Messaggio di errore in italiano
        });
    }
    
    // ============================================ //
    // RICERCA UTENTE NEL DATABASE
    // ============================================ //
    const user = findUserByUsername(username);
    // Cerca l'utente con lo username inserito
    // Se non esiste, user sarà undefined
    
    // ============================================ //
    // VERIFICA ESISTENZA UTENTE
    // ============================================ //
    if (!user) {
        // Se l'utente non esiste nel database
        
        return res.status(401).json({ 
            // status(401): Unauthorized - non autorizzato
            // Nota: per sicurezza, non distinguiamo tra "utente inesistente" e "password errata"
            // Si dice sempre "Credenziali non valide" per evitare attacchi di enumerazione
            
            success: false, 
            message: 'Credenziali non valide' 
        });
    }
    
    // ============================================ //
    // VERIFICA PASSWORD (ATTUALMENTE IN CHIARO)
    // ============================================ //
    // NOTA: In produzione, usa bcrypt per hashare le password
    // Commento che avvisa: questa implementazione NON è sicura per un ambiente reale
    
    if (user.password !== password) {
        // Confronto DIRETTO tra stringhe (password in chiaro)
        // In sicurezza, NESSUN sistema dovrebbe salvare password in chiaro
        
        return res.status(401).json({ 
            success: false, 
            message: 'Credenziali non valide' 
            // Stesso messaggio generico per sicurezza
        });
    }
    
    // ============================================ //
    // LOGIN RIUSCITO - CREAZIONE SESSIONE
    // ============================================ //
    req.session.user = {
        // Crea un oggetto nella sessione chiamato 'user'
        // Questo oggetto persisterà tra le richieste dello stesso utente
        
        id: user.id,           // ID univoco dell'utente
        username: user.username, // Nome utente
        role: user.role        // Ruolo: 'user' o 'admin' (utile per autorizzazioni)
    };
    // Il cookie di sessione viene inviato automaticamente al client
    
    res.json({ 
        // Risposta di successo (status 200 di default)
        
        success: true, 
        message: 'Login riuscito',
        role: user.role  // Invia il ruolo al frontend (es. per mostrare interfacce diverse)
    });
});

/* ============================================ */
// 7. MIDDLEWARE PER VERIFICARE L'AUTENTICAZIONE
/* ============================================ */

function requireAuth(req, res, next) {
    // Middleware che verifica se l'utente è loggato
    // next: funzione da chiamare per passare al middleware successivo o alla route
    
    if (req.session.user) {
        // Se esiste la sessione (utente autenticato)
        
        next();
        // Chiama next() per procedere alla route successiva
        // L'utente può accedere alla risorsa protetta
        
    } else {
        // Se NON è autenticato
        
        res.status(401).json({ 
            success: false, 
            message: 'Autenticazione richiesta' 
        });
        // Invia errore 401 (non autorizzato)
        // NON chiama next(), la richiesta si ferma qui
    }
}

/* ============================================ */
// 8. MIDDLEWARE PER VERIFICARE I PRIVILEGI ADMIN
/* ============================================ */

function requireAdmin(req, res, next) {
    // Middleware per controllare se l'utente è ADMIN
    // Richiama requireAuth implicito? NO - va usato DOPO requireAuth o deve verificare entrambi
    
    if (req.session.user && req.session.user.role === 'admin') {
        // Condizione: utente esiste NELLA sessione E il suo ruolo è 'admin'
        
        next();
        // Utente admin: procedi
        
    } else {
        // Utente non loggato OPPURE loggato ma non admin
        
        res.status(403).json({ 
            // status(403): Forbidden - vietato
            // Diverso da 401: 401 è "non autenticato", 403 è "autenticato ma non autorizzato"
            
            success: false, 
            message: 'Accesso negato. Privilegi admin richiesti' 
        });
    }
}

/* ============================================ */
// 9. ROTTA PER OTTENERE I DATI DELL'UTENTE CORRENTE
/* ============================================ */

router.get('/api/user', requireAuth, (req, res) => {
    // GET /api/user: restituisce le informazioni dell'utente loggato
    // requireAuth: PRIMA esegue il middleware che verifica il login
    // Solo se il middleware chiama next(), arriva a questa funzione
    
    res.json({
        success: true,
        user: req.session.user  // Invia l'oggetto utente salvato nella sessione
    });
});

/* ============================================ */
// 10. ROTTA ADMIN PER OTTENERE TUTTI GLI UTENTI
/* ============================================ */

router.get('/api/users', requireAdmin, (req, res) => {
    // GET /api/users: solo ADMIN (requireAdmin middleware)
    // Questa rotta restituisce la lista completa di tutti gli utenti registrati
    
    const users = getUsers();
    // Legge tutti gli utenti dal file JSON
    
    // ============================================ //
    // MAP: rimuove le password per sicurezza
    // ============================================ //
    const safeUsers = users.map(({ password, ...user }) => user);
    // .map(): trasforma ogni elemento dell'array
    // La sintassi ({ password, ...user }) è una DESTRUTTURAZIONE con REST
    // Prende l'oggetto utente, estrae la proprietà 'password' e raccoglie tutto il resto in 'user'
    // In pratica: rimuove il campo password dall'oggetto
    
    res.json({
        success: true,
        users: safeUsers  // Lista utenti SENZA password
    });
});

/* ============================================ */
// 11. ESPORTA IL ROUTER PER USARLO NEL SERVER
/* ============================================ */

module.exports = router;
// Rende il router disponibile per essere importato da altri file
// Nel server principale: const authRoutes = require('./auth');