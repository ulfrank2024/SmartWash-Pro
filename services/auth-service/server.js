const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// const authRoutes = require('./routes/auth');

app.use(bodyParser.json());

app.use('/api/v1/auth', /*authRoutes*/);

app.get('/', (req, res) => {
    res.send('Auth Service est en marche !');
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Le service d'authentification écoute sur le port ${port}`);
});

server.on('error', (err) => {
    console.error("Erreur lors du démarrage du serveur d'authentification :", err);
    process.exit(1);
});
