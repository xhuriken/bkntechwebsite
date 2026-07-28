# ─────────────────────────────────────────────────────────────────────────────
# deploy.ps1 — Déploiement BknTech → VPS OVH
# Usage : .\deploy.ps1
# ─────────────────────────────────────────────────────────────────────────────

# Charger les variables depuis .env
$envFile = Join-Path $PSScriptRoot ".env"
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -match "^\s*$") { return }
    $parts = $_ -split "=", 2
    $key = $parts[0].Trim()
    $val = $parts[1].Trim().Trim('"')
    [System.Environment]::SetEnvironmentVariable($key, $val)
}

$VPS_HOST     = [System.Environment]::GetEnvironmentVariable("VPS_HOST")
$VPS_USER     = [System.Environment]::GetEnvironmentVariable("VPS_ROOT_USER")
$VPS_PASSWORD = [System.Environment]::GetEnvironmentVariable("VPS_ROOT_PASSWORD")
$VPS_PATH     = "/var/www/bkntech"
$VPS_PORT     = [System.Environment]::GetEnvironmentVariable("VPS_PORT")

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Deploiement BknTech -> $VPS_HOST" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Helper SSH avec mot de passe
function Invoke-SSH {
    param([string]$Command)
    $proc = Start-Process -FilePath "ssh" `
        -ArgumentList @("-o", "StrictHostKeyChecking=no", "-o", "PasswordAuthentication=yes", "-p", $VPS_PORT, "${VPS_USER}@${VPS_HOST}", $Command) `
        -PassThru -Wait -NoNewWindow
}

# ─── Étape 1 : Créer le répertoire distant ────────────────────────────────────
Write-Host "`n[1/5] Preparation du repertoire VPS..." -ForegroundColor Yellow
$mkdirCmd = "mkdir -p $VPS_PATH"

# On utilise WSL si disponible, sinon Plink (PuTTY)
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
$plink = Get-Command plink -ErrorAction SilentlyContinue

if ($wsl) {
    Write-Host "  -> Utilisation de WSL" -ForegroundColor Gray
    $wslPath = $PSScriptRoot -replace "\\", "/" -replace "C:", "/mnt/c"

    # SSH via WSL (avec sshpass)
    function SSH-CMD { param($cmd) wsl bash -c "sshpass -p '$VPS_PASSWORD' ssh -o StrictHostKeyChecking=no -p $VPS_PORT ${VPS_USER}@${VPS_HOST} '$cmd'" }
    function RSYNC-CMD { param($src, $dst) wsl bash -c "sshpass -p '$VPS_PASSWORD' rsync -avz --delete --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='.env' --exclude='*.log' -e 'ssh -o StrictHostKeyChecking=no -p $VPS_PORT' '$src' '${VPS_USER}@${VPS_HOST}:$dst'" }

} elseif ($plink) {
    Write-Host "  -> Utilisation de PuTTY plink" -ForegroundColor Gray
    function SSH-CMD { param($cmd) echo "y" | plink -batch -pw $VPS_PASSWORD -P $VPS_PORT ${VPS_USER}@${VPS_HOST} $cmd }
    function RSYNC-CMD { param($src, $dst) Write-Host "rsync non dispo sans WSL - skip" -ForegroundColor Red }
} else {
    Write-Host "ERREUR: WSL ou PuTTY requis. Installe WSL ou execute deploy.sh depuis WSL." -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour deployer manuellement, execute depuis WSL :" -ForegroundColor Yellow
    Write-Host "  chmod +x deploy.sh && ./deploy.sh" -ForegroundColor White
    exit 1
}

# ─── Étape 2 : Préparer le dossier ────────────────────────────────────────────
Write-Host "`n[2/5] Creation du dossier..." -ForegroundColor Yellow
SSH-CMD "mkdir -p $VPS_PATH"

# ─── Étape 3 : Transfert des fichiers ─────────────────────────────────────────
Write-Host "`n[3/5] Transfert des fichiers..." -ForegroundColor Yellow
$wslSrc = $PSScriptRoot -replace "\\", "/" -replace "^([A-Za-z]):", '/mnt/$1'.ToLower()
$wslSrc = "/mnt/" + $PSScriptRoot.Substring(0,1).ToLower() + $PSScriptRoot.Substring(2).Replace("\", "/")
RSYNC-CMD "$wslSrc/" "$VPS_PATH/"

# ─── Étape 4 : Créer .env.production sur le VPS ──────────────────────────────
Write-Host "`n[4/5] Creation du .env.production..." -ForegroundColor Yellow

# Lire SMTP_PASS et ADMIN_PASSWORD depuis .env local
$smtpPass = [System.Environment]::GetEnvironmentVariable("SMTP_PASS")
if (-not $smtpPass) { $smtpPass = "" }
$adminPass = [System.Environment]::GetEnvironmentVariable("ADMIN_PASSWORD")
if (-not $adminPass) { $adminPass = "" }

SSH-CMD @"
cat > $VPS_PATH/.env.production << 'ENVEOF'
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@bkntech.fr
SMTP_PASS=$smtpPass
SMTP_TO=contact@bkntech.fr
ADMIN_PASSWORD=$adminPass
ENVEOF
"@

# ─── Étape 5 : Deploy sur le VPS ──────────────────────────────────────────────
Write-Host "`n[5/5] Build + Lancement Docker Compose..." -ForegroundColor Yellow

SSH-CMD @"
set -e
cd $VPS_PATH

# Liberer les ports 80/443 si Apache ou Nginx bare-metal tournent
systemctl stop apache2 2>/dev/null && systemctl disable apache2 2>/dev/null || true
systemctl stop nginx 2>/dev/null && systemctl disable nginx 2>/dev/null || true

# Arreter l'ancien compose si present
docker compose down --remove-orphans 2>/dev/null || true

# Installer Docker si absent
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Build + start
docker compose build --no-cache
docker compose up -d
sleep 5
docker compose ps

echo 'Deploiement termine!'
"@

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "  Deploiement termine!" -ForegroundColor Green
Write-Host "  https://bkntech.fr" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
