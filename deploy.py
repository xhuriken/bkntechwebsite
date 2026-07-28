#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy.py -- Deploiement BknTech -> VPS OVH
Usage : python deploy.py
Dépendances : paramiko (pip install paramiko)
"""

import os
import sys
import stat
import time
import socket
from pathlib import Path

try:
    import paramiko
except ImportError:
    print("❌ paramiko manquant. Lance : python -m pip install paramiko")
    sys.exit(1)

# Forcer UTF-8 sur Windows
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# --- Couleurs console (ANSI) ---
R = "\033[91m"; G = "\033[92m"; Y = "\033[93m"; C = "\033[96m"; NC = "\033[0m"
def ok(msg):   print(f"  {G}[OK] {msg}{NC}")
def warn(msg): print(f"  {Y}[!!] {msg}{NC}")
def err(msg):  print(f"  {R}[KO] {msg}{NC}"); sys.exit(1)
def step(n, msg): print(f"\n{Y}[{n}] {msg}...{NC}")

# ─── Charger .env ─────────────────────────────────────────────────────────────
script_dir = Path(__file__).parent
env_file = script_dir / ".env"

if not env_file.exists():
    err(f".env introuvable : {env_file}")

env_vars = {}
for line in env_file.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    if "=" in line:
        k, _, v = line.partition("=")
        env_vars[k.strip()] = v.strip().strip('"').strip("'")

VPS_HOST     = env_vars.get("VPS_HOST", "").strip()
VPS_USER     = env_vars.get("VPS_USER", "ubuntu").strip()
VPS_PASSWORD = env_vars.get("VPS_ROOT_PASSWORD", "").strip()
VPS_PORT     = int(env_vars.get("VPS_PORT", "22"))
VPS_SSH_KEY  = env_vars.get("VPS_SSH_KEY_PATH", "~/.ssh/id_ed25519").strip()
VPS_SSH_KEY  = str(Path(VPS_SSH_KEY.replace("~", str(Path.home()))))
SMTP_PASS    = env_vars.get("SMTP_PASS", "")
ADMIN_PASSWORD = env_vars.get("ADMIN_PASSWORD", "admin123")
REMOTE_PATH  = "/var/www/bkntech"

print(f"\n{C}==============================================={NC}")
print(f"{C}  >> Deploiement BknTech -> {VPS_HOST}{NC}")
print(f"{C}==============================================={NC}")
print(f"  Host : {C}{VPS_HOST}{NC}:{VPS_PORT}")
print(f"  User : {C}{VPS_USER}{NC}")
print(f"  Key  : {C}{VPS_SSH_KEY}{NC}")
print(f"  Path : {C}{REMOTE_PATH}{NC}")

# ─── Connexion SSH ─────────────────────────────────────────────────────────────
def get_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    key_path = Path(VPS_SSH_KEY)
    if key_path.exists():
        # Essai avec clé SSH en priorité
        try:
            client.connect(
                hostname=VPS_HOST,
                port=VPS_PORT,
                username=VPS_USER,
                key_filename=str(key_path),
                timeout=30,
                look_for_keys=False,
                allow_agent=False
            )
            return client
        except paramiko.AuthenticationException:
            pass  # Fallback sur mot de passe

    # Fallback : mot de passe
    client.connect(
        hostname=VPS_HOST,
        port=VPS_PORT,
        username=VPS_USER,
        password=VPS_PASSWORD,
        timeout=30,
        look_for_keys=False,
        allow_agent=False
    )
    return client

def run_ssh(client, cmd, check=True):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode("utf-8", errors="replace")
    err_out = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out.strip():
        for line in out.strip().splitlines():
            print(f"    {line}")
    if err_out.strip() and rc != 0:
        for line in err_out.strip().splitlines():
            print(f"    {Y}{line}{NC}")
    if check and rc != 0:
        err(f"Commande échouée (code {rc}) : {cmd[:80]}")
    return rc, out, err_out

def upload_dir(sftp, local_dir: Path, remote_dir: str, exclude=None):
    """Upload récursif d'un dossier local vers le VPS via SFTP."""
    if exclude is None:
        exclude = {"node_modules", "dist", ".git", ".env", ".env.production",
                   "*.log", "deploy.py", "deploy.ps1", "deploy.sh"}

    def should_exclude(name):
        import fnmatch
        for pat in exclude:
            if fnmatch.fnmatch(name, pat) or name == pat:
                return True
        return False

    # Créer le dossier distant si besoin
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        sftp.mkdir(remote_dir)

    total = 0
    for item in local_dir.iterdir():
        if should_exclude(item.name):
            continue
        remote_item = f"{remote_dir}/{item.name}"
        if item.is_dir():
            try:
                sftp.stat(remote_item)
            except FileNotFoundError:
                sftp.mkdir(remote_item)
            total += upload_dir(sftp, item, remote_item, exclude)
        else:
            sftp.put(str(item), remote_item)
            total += 1

    return total

# ─── [1/5] Test de connexion ──────────────────────────────────────────────────
step("1/5", "Connexion SSH au VPS")
try:
    ssh = get_ssh()
    ok(f"Connecté à {VPS_HOST}")
except Exception as e:
    err(f"Connexion impossible : {e}")

# ─── [2/5] Préparer le dossier distant ───────────────────────────────────────
step("2/5", "Préparation du dossier distant")
run_ssh(ssh, f"sudo mkdir -p {REMOTE_PATH} && sudo chown -R ubuntu:ubuntu {REMOTE_PATH}")
ok(f"Dossier {REMOTE_PATH} prêt")

# ─── [3/5] Upload des fichiers ────────────────────────────────────────────────
step("3/5", "Upload des fichiers (SFTP)")
sftp = ssh.open_sftp()
total_files = upload_dir(sftp, script_dir, REMOTE_PATH)
sftp.close()
ok(f"{total_files} fichiers transférés")

# ─── [4/5] Créer .env.production sur le VPS ──────────────────────────────────
step("4/5", "Création du .env.production sur le VPS")
env_prod_content = f"""SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@bkntech.fr
SMTP_PASS={SMTP_PASS}
SMTP_TO=contact@bkntech.fr
ADMIN_PASSWORD={ADMIN_PASSWORD}
"""
run_ssh(ssh, f"cat > {REMOTE_PATH}/.env.production << 'ENVEOF'\n{env_prod_content}\nENVEOF")
ok(".env.production créé")

# ─── [5/5] Arrêt ancien site + Docker Compose ────────────────────────────────
step("5/5", "Arrêt ancien site + Build + Lancement Docker")

deploy_script = f"""
set -e
cd {REMOTE_PATH}

echo '  → Libération des ports 80/443...'
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

echo '  → Arrêt anciens conteneurs...'
sudo docker compose down --remove-orphans 2>/dev/null || true
sudo docker image prune -f 2>/dev/null || true

# Installer Docker si absent
if ! command -v docker &> /dev/null; then
    echo '  → Installation de Docker...'
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker ubuntu
    sudo systemctl enable docker
    sudo systemctl start docker
fi

echo '  → Build des images Docker...'
sudo docker compose build --no-cache

echo '  → Lancement des conteneurs...'
sudo docker compose up -d

echo '  → Attente démarrage (10s)...'
sleep 10

echo '  → Status des conteneurs :'
sudo docker compose ps
"""

rc, out, err_out = run_ssh(ssh, deploy_script, check=False)
if rc == 0:
    ok("Docker Compose opérationnel")
else:
    warn(f"Code retour : {rc} — vérifier les logs")

# ─── Fermeture + Vérification ─────────────────────────────────────────────────
ssh.close()

print(f"\n  → Vérification HTTP...")
time.sleep(5)
try:
    s = socket.create_connection((VPS_HOST, 80), timeout=10)
    s.close()
    ok("Port 80 accessible ✓")
except Exception:
    warn("Port 80 pas encore accessible (Let's Encrypt prend 1-2 min)")

print(f"\n{G}==============================================={NC}")
print(f"{G}  [OK] Deploiement termine !{NC}")
print(f"{G}  >> https://bkntech.fr{NC}")
print(f"{G}==============================================={NC}\n")
