const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Percorso del database degli utenti
const USERS_DB_PATH = path.join(__dirname, 'data', 'users.json');

// Funzione per leggere gli utenti dal database
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        console.error('Errore nella lettura del database:', error);
        return [];
    }
}

// Funzione per trovare un utente per username
function findUserByUsername(username) {
    const users = getUsers();
    return users.find(user => user.username === username);
}

// Rotta per il login (POST)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validazione input
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Inserisci username e password' 
        });
    }
    
    // Cerca l'utente nel database
    const user = findUserByUsername(username);
    
    // Verifica credenziali
    if (!user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Credenziali non valide' 
        });
    }
    
    // Per il tuo database attuale (password in chiaro)
    // NOTA: In produzione, usa bcrypt per hashare le password
    if (user.password !== password) {
        return res.status(401).json({ 
            success: false, 
            message: 'Credenziali non valide' 
        });
    }
    
    // Login riuscito - crea sessione
    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
    };
    
    res.json({ 
        success: true, 
        message: 'Login riuscito',
        role: user.role
    });
});

// Middleware per verificare se l'utente è autenticato
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Autenticazione richiesta' 
        });
    }
}

// Middleware per verificare se l'utente è admin
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Accesso negato. Privilegi admin richiesti' 
        });
    }
}

// Rotta per ottenere i dati dell'utente corrente
router.get('/api/user', requireAuth, (req, res) => {
    res.json({
        success: true,
        user: req.session.user
    });
});

// Rotta admin per ottenere tutti gli utenti (esempio)
router.get('/api/users', requireAdmin, (req, res) => {
    const users = getUsers();
    // Rimuovi le password prima di inviare
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json({
        success: true,
        users: safeUsers
    });
});

module.exports = router;