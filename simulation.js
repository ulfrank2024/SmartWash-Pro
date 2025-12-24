// Ce script simule un ESP32 qui envoie des données au service IoT.

const fetch = require('node-fetch'); // Assurez-vous d'avoir node-fetch installé: npm install node-fetch

const IOT_SERVICE_URL = 'http://localhost:5003/api/v1/iot/collect';

// Exemple de données de transaction
const transactionData = {
  station_id: 'STATION_007',
  event_type: 'transaction',
  payload: {
    montant_cfa: 500,
    duree_sec: 300,
    timestamp: new Date().toISOString(),
  },
};

// Exemple de données de mise à jour de statut
const statusData = {
    station_id: 'STATION_004',
    event_type: 'status_update',
    payload: {
      status: 'BUSY',
      timestamp: new Date().toISOString(),
    },
};


/**
 * Envoie des données au service IoT.
 * @param {object} data - Les données à envoyer.
 */
async function sendData(data) {
  console.log(`Envoi des données au service IoT :`, JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(IOT_SERVICE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Réponse du serveur :', responseData);

  } catch (error) {
    console.error("Erreur lors de l'envoi des données :", error.message);
  }
}

// Lancer la simulation
(async () => {
  console.log('--- Lancement de la simulation IoT ---');
  
  // Simuler une transaction
  await sendData(transactionData);
  
  console.log('\n----------------------------------------\n');

  // Attendre 2 secondes avant la prochaine simulation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simuler une mise à jour de statut
  await sendData(statusData);

  console.log('\n--- Fin de la simulation IoT ---');
})();
