@echo off
REM Lancer les containers Docker en mode détaché
docker-compose up -d

REM Attendre 10 secondes pour que les services démarrent
timeout /t 10 /nobreak

REM Ouvrir la page frontend dans le navigateur par défaut
start http://localhost:3000

REM Afficher les logs Docker en temps réel (appuyez sur Ctrl+C pour quitter)
docker-compose logs -f
