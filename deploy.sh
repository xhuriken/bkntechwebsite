#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Déploiement BknTech → VPS OVH
# Usage (depuis WSL) : chmod +x deploy.sh && ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Couleurs
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 Déploiement BknTech → VPS OVH${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"

# ─── Charger le .env ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Fichier .env introuvable : $ENV_FILE${NC}"
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

# Variables VPS
VPS_HOST="${VPS_HOST:-151.80.147.208}"
VPS_USER="${VPS_ROOT_USER:-root}"
VPS_PASSWORD="${VPS_ROOT_PASSWORD}"
VPS_PORT="${VPS_PORT:-22}"
VPS_REMOTE_PATH="/var/www/bkntech"

# Variables SMTP (optionnel, peut être vide si pas encore configuré)
SMTP_PASS="${SMTP_PASS:-}"

echo -e "  Host   : ${CYAN}$VPS_HOST${NC}"
echo -e "  User   : ${CYAN}$VPS_USER${NC}"
echo -e "  Port   : ${CYAN}$VPS_PORT${NC}"
echo -e "  Path   : ${CYAN}$VPS_REMOTE_PATH${NC}"

# ─── Vérifier sshpass ─────────────────────────────────────────────────────────
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installation de sshpass...${NC}"
    sudo apt-get update -qq && sudo apt-get install -y -qq sshpass
fi

# ─── Helpers SSH / SCP / RSYNC ────────────────────────────────────────────────
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -p $VPS_PORT"
SSHPASS_PREFIX="sshpass -p '$VPS_PASSWORD'"

ssh_cmd() {
    sshpass -p "$VPS_PASSWORD" ssh $SSH_OPTS "${VPS_USER}@${VPS_HOST}" "$1"
}

rsync_cmd() {
    sshpass -p "$VPS_PASSWORD" rsync -avz --delete \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        --exclude='.env' \
        --exclude='.env.*' \
        --exclude='*.log' \
        --exclude='deploy.ps1' \
        --exclude='deploy.sh' \
        -e "ssh $SSH_OPTS" \
        "$1" "${VPS_USER}@${VPS_HOST}:$2"
}

# ─── [1/5] Préparer le répertoire ────────────────────────────────────────────
echo -e "\n${YELLOW}[1/5] Préparation du répertoire VPS...${NC}"
ssh_cmd "mkdir -p $VPS_REMOTE_PATH"
echo -e "  ${GREEN}✓ Dossier créé${NC}"

# ─── [2/5] Transférer les fichiers ───────────────────────────────────────────
echo -e "\n${YELLOW}[2/5] Transfert des fichiers vers le VPS...${NC}"
rsync_cmd "$SCRIPT_DIR/" "$VPS_REMOTE_PATH/"
echo -e "  ${GREEN}✓ Fichiers transférés${NC}"

# ─── [3/5] Créer .env.production sur le VPS ──────────────────────────────────
echo -e "\n${YELLOW}[3/5] Création du .env.production sur le VPS...${NC}"
ssh_cmd "cat > $VPS_REMOTE_PATH/.env.production << 'ENVEOF'
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@bkntech.fr
SMTP_PASS=${SMTP_PASS}
SMTP_TO=contact@bkntech.fr
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENVEOF"
echo -e "  ${GREEN}✓ .env.production créé${NC}"

# ─── [4/5] Arrêter l'ancien site + lancer Docker ─────────────────────────────
echo -e "\n${YELLOW}[4/5] Arrêt ancien site + Build Docker Compose...${NC}"
ssh_cmd "
set -e
cd $VPS_REMOTE_PATH

echo '  → Libération des ports 80/443...'
systemctl stop apache2 2>/dev/null && systemctl disable apache2 2>/dev/null || true
systemctl stop nginx 2>/dev/null && systemctl disable nginx 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true

echo '  → Arrêt des anciens conteneurs...'
docker compose down --remove-orphans 2>/dev/null || true

# Nettoyer les images orphelines pour économiser de l'espace
docker image prune -f 2>/dev/null || true

# Installer Docker si absent
if ! command -v docker &> /dev/null; then
    echo '  → Installation de Docker...'
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

echo '  → Build + lancement des conteneurs...'
docker compose build --no-cache
docker compose up -d

echo '  → Attente démarrage (10s)...'
sleep 10
docker compose ps
"
echo -e "  ${GREEN}✓ Docker Compose lancé${NC}"

# ─── [5/5] Vérification ──────────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/5] Vérification finale...${NC}"
sleep 3

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$VPS_HOST" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "  ${GREEN}✓ Site répond (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "  ${YELLOW}⚠️  HTTP $HTTP_STATUS — SSL/Let's Encrypt peut prendre 1-2 min${NC}"
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Déploiement terminé !${NC}"
echo -e "${GREEN}  🌐 https://bkntech.fr${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
