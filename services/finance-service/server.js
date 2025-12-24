const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5004;

// const financeRoutes = require('./routes/finance');

app.use(bodyParser.json());

app.use('/api/v1/finance', /*financeRoutes*/);

app.get('/', (req, res) => {
    res.send('Finance Service est en marche !');
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Le service des finances écoute sur le port ${port}`);
});

server.on('error', (err) => {
    console.error("Erreur lors du démarrage du service des finances :", err);
    process.exit(1);
});
