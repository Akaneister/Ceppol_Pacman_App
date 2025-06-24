const express = require('express');
const https = require('https');
const router = express.Router();

// Proxy GetCapabilities
router.get('/', (req, res) => {
  try {
    const url = 'https://services.data.shom.fr/vpsg23trbswcecn8w5gx34l0/wmts?service=WMTS&version=1.0.0&request=GetCapabilities';

    // Création de l'en-tête Authorization en base64
    const username = 'operations@ceppol.fr';
    const password = 'Amoco1978@';
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    const options = {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (response) => {
      // Ajouter les en-têtes CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('content-type', response.headers['content-type'] || 'application/xml');
      res.setHeader('cache-control', response.headers['cache-control'] || 'no-cache');
      
      response.pipe(res);
    }).on('error', (error) => {
      console.error('Erreur proxy SHOM:', error.message);
      res.status(502).json({ error: 'Erreur de communication avec SHOM' });
    });

  } catch (err) {
    console.error('Erreur interne proxy SHOM:', err.message);
    res.status(500).json({ error: 'Erreur proxy SHOM' });
  }
});

// Proxy WMTS tiles
router.get('/wmts/:layer/:z/:x/:y.png', (req, res) => {
  const { layer, z, x, y } = req.params;
  const url = `https://services.data.shom.fr/vpsg23trbswcecn8w5gx34l0/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=3857&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`;
  
  const username = 'operations@ceppol.fr';
  const password = 'Amoco1978@';
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  const options = { 
    headers: { 
      'Authorization': `Basic ${auth}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } 
  };

  https.get(url, options, (response) => {
    // Ajouter les en-têtes CORS pour les tuiles
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('content-type', response.headers['content-type'] || 'image/png');
    res.setHeader('cache-control', 'public, max-age=3600'); // Cache les tuiles 1 heure
    
    response.pipe(res);
  }).on('error', (error) => {
    console.error('Erreur proxy WMTS SHOM:', error.message);
    res.status(502).json({ error: 'Erreur de communication avec SHOM WMTS' });
  });
});

module.exports = router;
