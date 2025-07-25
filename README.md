# README - Lancement de l'application Marine

## 📦 Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé sur votre machine :

- **Docker**  
  👉 [Installer Docker](https://docs.docker.com/get-docker/)

- **Docker Compose** (généralement inclus avec Docker Desktop)

---
 Installation automatique de WSL via Docker (facultatif)

Lorsque vous lancez Docker pour la première fois, il va ouvrir un terminal où il te propose d’installer WSL si ce n’est pas déjà fait.

Il suffit souvent d’appuyer sur Entrée pour que le système installe automatiquement WSL 2.

Cette étape peut prendre quelques minutes, car Windows va télécharger et configurer la sous-couche Linux.

Il vous demandera surrement de redémarrer le système

## 🚀 Lancement de l'application

1. Placez-vous dans le dossier du projet.
2. Faite click Droit -> Ouvrir un terminal
3. Ouvrez un terminal et naviguez jusqu'au dossier contenant les fichiers de l'application.
4. Lancez les conteneurs Docker avec la commande suivante :

```bash
docker-compose up --build
```
# Notes

La première fois, Docker télécharge les images et initialise la base de données. Cela peut prendre quelques minutes.

Pour arrêter l'application, appuyez sur Ctrl + C dans le terminal 

Les mots de passes par defauts sont : 

**Admin : admin**
**User : user**

## Contact

Pour toute question ou assistance, vous pouvez me joindre :

**📞 Téléphone : 07 84 52 33 09**  
**✉️ Email : oscar.vieujean@outlook.com**
