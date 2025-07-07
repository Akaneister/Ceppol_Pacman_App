/*
testEmail.js
==================== Description ==================//

Script de test pour vérifier la configuration de l'envoi d'emails.
*/

const { testerConfiguration, envoyerNotificationNouveauRapport } = require('./services/emailService');

async function testerEmail() {
  console.log('Test de la configuration email...');
  
  // Test de la configuration
  const configOk = await testerConfiguration();
  if (!configOk) {
    console.log('❌ Échec du test de configuration');
    return;
  }
  console.log('✅ Configuration email valide');

  // Test d'envoi d'un email de démonstration
  console.log('Envoi d\'un email de test...');
  const testData = {
    id_rapport: 999,
    date_evenement: new Date(),
    localisation: 'Test Location',
    zone_geographique: 'Zone Test',
    description_globale: 'Ceci est un test d\'envoi d\'email pour la création de rapport.'
  };

  const result = await envoyerNotificationNouveauRapport(testData);
  if (result.success) {
    console.log('✅ Email de test envoyé avec succès!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ Échec de l\'envoi de l\'email de test');
    console.log('Erreur:', result.error);
  }
}

// Exécuter le test
testerEmail().catch(console.error);
