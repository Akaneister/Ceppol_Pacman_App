@echo off
REM Lancer les containers en mode détaché
docker-compose up -d

REM Attendre 10 secondes pour que les services démarrent
timeout /t 10 /nobreak

REM Ouvrir la page frontend dans le navigateur par défaut
start http://localhost:3000

REM Afficher les logs en temps réel (optionnel)
docker-compose logs -f
