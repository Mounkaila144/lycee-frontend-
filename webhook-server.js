const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9002;
const SECRET = process.env.WEBHOOK_SECRET || 'change-this-secret-key';
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy.sh');
const LOG_FILE = path.join(__dirname, 'webhook.log');

// Fonction de logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Vérifier la signature GitHub
function verifySignature(payload, signature) {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Créer le serveur webhook
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        // Vérifier la signature
        const signature = req.headers['x-hub-signature-256'];

        if (!verifySignature(body, signature)) {
          log('⚠️  Signature invalide - requête rejetée');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }

        const payload = JSON.parse(body);
        const event = req.headers['x-github-event'];

        log(`📩 Événement reçu: ${event}`);

        // Traiter uniquement les événements push
        if (event === 'push') {
          const branch = payload.ref.replace('refs/heads/', '');
          const commits = payload.commits || [];
          const pusher = payload.pusher?.name || 'unknown';

          log(`📌 Push détecté sur la branche: ${branch} par ${pusher}`);
          log(`📝 ${commits.length} commit(s) reçu(s)`);

          // Déployer uniquement si c'est la branche master
          if (branch === 'master') {
            log('🚀 Démarrage du déploiement...');

            // Répondre immédiatement à GitHub (évite le timeout)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'accepted',
              message: 'Deployment started in background'
            }));

            // Exécuter le script de déploiement en arrière-plan
            exec(`bash ${DEPLOY_SCRIPT}`, {
              cwd: __dirname,
              maxBuffer: 10 * 1024 * 1024 // 10MB buffer pour les gros logs
            }, (error, stdout, stderr) => {
              if (error) {
                log('❌ Erreur lors du déploiement:');
                log(error.message);
                if (stdout) log(stdout);
                if (stderr) log(stderr);
              } else {
                log('✅ Déploiement réussi');
                if (stdout) log(stdout);
              }
            });
          } else {
            log(`⏭️  Branche ${branch} ignorée (déploiement uniquement sur master)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'ignored',
              message: `Branch ${branch} ignored`
            }));
          }
        } else if (event === 'ping') {
          log('🏓 Ping reçu de GitHub');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'pong' }));
        } else {
          log(`⏭️  Événement ${event} ignoré`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ignored', event }));
        }
      } catch (error) {
        log(`❌ Erreur lors du traitement: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    // Endpoint de santé
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  log('='.repeat(50));
  log(`🎯 Serveur webhook démarré sur le port ${PORT}`);
  log(`🔒 Secret configuré: ${SECRET.substring(0, 4)}...`);
  log(`📁 Répertoire: ${__dirname}`);
  log('='.repeat(50));
});

// Gestion des erreurs
server.on('error', (error) => {
  log(`❌ Erreur serveur: ${error.message}`);
  process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  log('🛑 Arrêt du serveur webhook...');
  server.close(() => {
    log('✅ Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('🛑 Arrêt du serveur webhook...');
  server.close(() => {
    log('✅ Serveur arrêté');
    process.exit(0);
  });
});
