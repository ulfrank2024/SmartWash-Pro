const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http'); // Importer le module http
const { Server } = require('socket.io'); // Importer Server depuis socket.io
const cors = require('cors'); // Import cors middleware

dotenv.config();

const app = express();
const port = process.env.PORT || 5003;

// Créer le serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Initialiser Socket.io avec le serveur HTTP
const io = new Server(server, {
    cors: {
        origin: "*", // Autoriser toutes les origines pour les tests, à restreindre en production
        methods: ["GET", "POST"]
    }
});

// Importer les routes et leur passer l'instance io
const iotRoutes = require('./routes/iot')(io);

app.use(bodyParser.json());
app.use(cors()); // Use cors middleware for Express routes

console.log("Démarrage du service IoT...");

// Routes
app.use('/api/v1/iot', iotRoutes);

app.get('/', (req, res) => {
    res.send('IoT Service est en marche !');
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
    console.log('Un client Socket.io est connecté :', socket.id);

    socket.on('disconnect', () => {
        console.log('Un client Socket.io est déconnecté :', socket.id);
    });

    // Optionnel: Émettre un événement à la connexion pour confirmer
    socket.emit('status', { message: 'Connecté au service IoT en temps réel.' });
});

server.listen(port, '0.0.0.0', () => { // Le serveur HTTP écoute maintenant
    console.log(`Le service IoT (HTTP + Socket.io) écoute sur le port ${port}`);
    const address = server.address();
    console.log(`Adresse du serveur: ${address.address}:${address.port}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Erreur: Le port ${port} est déjà utilisé.`);
    } else if (err.code === 'EACCES') {
        console.error(`Erreur: Permissions insuffisantes pour utiliser le port ${port}.`);
    } else {
        console.error("Erreur lors du démarrage du serveur :", err);
    }
    process.exit(1);
});