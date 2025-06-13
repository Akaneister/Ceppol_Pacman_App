import subprocess
import os

# Chemins vers les répertoires
frontend_dir = r"D:\Stage\MarineV3\frontend"
backend_dir = r"D:\Stage\MarineV3\backend"
project_root = r"D:\Stage\MarineV3"

# Commande pour ouvrir un terminal PowerShell et exécuter une commande sans fermer
def launch_powershell(path, command):
    subprocess.Popen([
        "powershell",
        "-NoExit",
        "-Command",
        f"cd '{path}'; {command}"
    ])

# Onglet 1 - frontend
launch_powershell(frontend_dir, "npm start")

# Onglet 2 - backend
launch_powershell(backend_dir, "npm start")

# Onglet 3 - ouvrir VS Code
subprocess.Popen(["code", project_root])
