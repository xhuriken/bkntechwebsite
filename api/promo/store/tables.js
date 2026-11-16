/**
 * Structure de la base des codes promo (version 2) : offres -> codes -> utilisations.
 * Les règles de base sont écrites DANS la base (CHECK, UNIQUE, clés étrangères) :
 * même si le code JavaScript avait un bug, SQLite refuserait une donnée incohérente.
 * Le statut d'un code (actif, épuisé, expiré, révoqué) n'est PAS stocké : il est calculé
 * à partir des dates et des utilisations, donc il ne peut jamais être faux.
 */
export function createTables(db) {
  db.exec(`
    PRAGMA foreign_keys = ON; -- SQLite ne vérifie les clés étrangères que si on le demande

    CREATE TABLE IF NOT EXISTS promo_campaigns (
      id                INTEGER PRIMARY KEY,
      slug              TEXT NOT NULL UNIQUE      -- lien public : /offre/<slug>
                        CHECK (length(slug) BETWEEN 3 AND 60 AND slug NOT GLOB '*[^a-z0-9-]*'),
      name              TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120), -- nom interne
      status            TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'active', 'paused', 'archived')),
      mode              TEXT NOT NULL CHECK (mode IN ('claim', 'shared', 'individual')),
      title             TEXT NOT NULL DEFAULT '' CHECK (length(title) <= 120),       -- page publique
      description       TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
      conditions        TEXT NOT NULL DEFAULT '' CHECK (length(conditions) <= 2000),
      discount_type     TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free_months')),
      discount_value    INTEGER NOT NULL CHECK (discount_value > 0), -- % | centimes | nombre de mois
      discount_months   INTEGER CHECK (discount_months IS NULL OR discount_months BETWEEN 1 AND 36),
      starts_at         TEXT,                     -- NULL = dès maintenant
      ends_at           TEXT,                     -- NULL = sans fin
      max_codes         INTEGER CHECK (max_codes IS NULL OR max_codes >= 0), -- NULL = illimité
      max_uses_per_code INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_code >= 1), -- 1 = usage unique
      code_prefix       TEXT NOT NULL DEFAULT 'BLEDGER'
                        CHECK (length(code_prefix) BETWEEN 2 AND 12 AND code_prefix NOT GLOB '*[^A-Z0-9]*'),
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL,
      CHECK (discount_type <> 'percent' OR discount_value <= 100),
      CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      id          INTEGER PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES promo_campaigns(id) ON DELETE RESTRICT,
      code        TEXT NOT NULL UNIQUE,
      email       TEXT CHECK (email IS NULL OR length(email) <= 254),
      google_sub  TEXT,                           -- compte Google qui l'a réclamé (mode claim)
      source      TEXT NOT NULL CHECK (source IN ('claim', 'manual', 'batch', 'shared')),
      max_uses    INTEGER NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
      expires_at  TEXT,                           -- NULL = suit la fin de l'offre
      revoked_at  TEXT,                           -- NULL = non révoqué
      note        TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 500),
      created_at  TEXT NOT NULL,
      UNIQUE (campaign_id, google_sub)            -- un code par compte Google et par offre
    );

    -- Historique : une ligne par utilisation, jamais supprimée. Annuler une utilisation la MARQUE
    -- (cancelled_at) : le code redevient disponible et la trace reste. RESTRICT : un code qui a un
    -- historique ne peut pas être supprimé (on le révoque).
    CREATE TABLE IF NOT EXISTS promo_redemptions (
      id        INTEGER PRIMARY KEY,
      code_id   INTEGER NOT NULL REFERENCES promo_codes(id) ON DELETE RESTRICT,
      used_at   TEXT NOT NULL,
      reference TEXT NOT NULL DEFAULT '' CHECK (length(reference) <= 120), -- n° client, facture...
      note      TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 500),
      cancelled_at TEXT                           -- NULL = valide ; sinon date d'annulation
    );

    -- Repères internes, ex. « reprise de l'ancienne version faite » (pour ne jamais la refaire).
    CREATE TABLE IF NOT EXISTS promo_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

    CREATE INDEX IF NOT EXISTS idx_codes_campaign ON promo_codes(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_redemptions_code ON promo_redemptions(code_id);
  `);
  // Base créée avant l'ajout de cancelled_at : on ajoute la colonne (sans toucher aux lignes).
  const columns = db.prepare('PRAGMA table_info(promo_redemptions)').all();
  if (!columns.some((c) => c.name === 'cancelled_at')) db.exec('ALTER TABLE promo_redemptions ADD COLUMN cancelled_at TEXT');
}
