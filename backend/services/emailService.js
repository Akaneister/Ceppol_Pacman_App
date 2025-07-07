/*
emailService.js
==================== Description ==================//

Description Global : Ce fichier contient le service d'envoi d'emails pour l'application.
Il utilise nodemailer pour envoyer des notifications par email lors de certains événements.

Fonctionnalités :
- Configuration de nodemailer avec Gmail
- Envoi d'emails de notification pour nouveaux rapports
- Templates d'emails personnalisés
*/

const nodemailer = require('nodemailer');

// Configuration du transporteur email avec Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ceppolceppol@gmail.com',
    pass: 'abcd efgh ijkl mnop' // Remplacez par votre mot de passe d'application Gmail (16 caractères)
  }
});

// Fonction pour envoyer un email de notification de nouveau rapport
const envoyerNotificationNouveauRapport = async (rapportData) => {
  try {
    // Liste des destinataires (vous pouvez la modifier selon vos besoins)
    const destinataires = [
      'oscar.vieujean@icloud.com',
      // Ajoutez d'autres emails selon vos besoins
    ];

    // Formatage de la date
    const dateFormatee = new Date(rapportData.date_evenement).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Template HTML pour l'email
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { line-height: 1.6; }
            .info-block { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .info-label { font-weight: bold; color: #2c3e50; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Nouveau Rapport CEPPOL</h1>
            </div>
            
            <div class="content">
              <p>Bonjour,</p>
              <p>Un nouveau rapport a été créé dans le système CEPPOL.</p>
              
              <div class="info-block">
                <p><span class="info-label">Numéro du rapport :</span> #${rapportData.id_rapport}</p>
                <p><span class="info-label">Date de l'événement :</span> ${dateFormatee}</p>
                <p><span class="info-label">Localisation :</span> ${rapportData.localisation || 'Non spécifiée'}</p>
                <p><span class="info-label">Zone géographique :</span> ${rapportData.zone_geographique || 'Non spécifiée'}</p>
              </div>
              
              ${rapportData.description_globale ? `
                <div class="info-block">
                  <p><span class="info-label">Description :</span></p>
                  <p>${rapportData.description_globale}</p>
                </div>
              ` : ''}
              
              <p>Vous pouvez consulter le rapport complet en vous connectant à l'application CEPPOL.</p>
              
              <p>Cordialement,<br>Système CEPPOL</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par le système CEPPOL. Merci de ne pas répondre à cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Configuration de l'email
    const mailOptions = {
      from: '"CEPPOL System" <ceppolceppol@gmail.com>',
      to: destinataires.join(', '),
      subject: `🚨 Nouveau rapport CEPPOL #${rapportData.id_rapport} - ${dateFormatee}`,
      html: htmlContent
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour tester la configuration email
const testerConfiguration = async () => {
  try {
    await transporter.verify();
    console.log('Configuration email valide');
    return true;
  } catch (error) {
    console.error('Erreur de configuration email:', error);
    return false;
  }
};

module.exports = {
  envoyerNotificationNouveauRapport,
  testerConfiguration
};
