const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Charger les variables d'environnement du fichier .env à la racine du service
dotenv.config();

const app = express();
const port = process.env.PORT || 5003;

// Importer les routes
const iotRoutes = require('./routes/iot');

// Middleware pour parser le JSON
app.use(bodyParser.json());

console.log("Démarrage du service IoT...");

// Routes
app.use('/api/v1/iot', iotRoutes);

app.get('/', (req, res) => {
    res.send('IoT Service est en marche !');
});

const server = app.listen(port, '0.0.0.0', () => { // Écouter sur 0.0.0.0
    console.log(`Le service IoT écoute sur le port ${port}`);
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