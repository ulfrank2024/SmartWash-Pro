// Ce script simule un ESP32 qui envoie des données au service IoT.

const axios = require('axios');

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
 * Envoie des données au service IoT en utilisant axios.
 * @param {object} data - Les données à envoyer.
 */
async function sendData(data) {
  console.log(`Envoi des données au service IoT :`, JSON.stringify(data, null, 2));
  
  try {
    const response = await axios.post(IOT_SERVICE_URL, data);
    console.log('Réponse du serveur :', response.data);
  } catch (error) {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // qui n'est pas dans la plage 2xx
      console.error("Erreur de réponse du serveur:", error.response.status, error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Aucune réponse reçue du serveur:", error.request);
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.error("Erreur lors de la configuration de la requête:", error.message);
    }
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
