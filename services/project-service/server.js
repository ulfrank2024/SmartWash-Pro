const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

// const projectRoutes = require('./routes/projects');

app.use(bodyParser.json());

app.use('/api/v1/projects', /*projectRoutes*/);

app.get('/', (req, res) => {
    res.send('Project Service est en marche !');
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Le service de projet écoute sur le port ${port}`);
});

server.on('error', (err) => {
    console.error("Erreur lors du démarrage du service de projet :", err);
    process.exit(1);
});
