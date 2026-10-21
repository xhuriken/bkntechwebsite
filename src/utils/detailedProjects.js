/**
 * Detailed extra data for portfolio projects
 * Contains rich features list, technical specifications, and photo gallery mockups.
 */
export const detailedProjects = {
  // 1. HUD - Gaming Devlog
  "1": {
    features: {
      fr: [
        { title: "Palette de couleurs", desc: "Pour la customisation de notre joueur, nous devons être capable de séléctionner notre couleur !" },
        { title: "Console CLI Intégrée", desc: "Terminal rétro-éclairé affichant le statut de confinement du Site-7 en temps réel." },
        { title: "Diagnostic de Surcharge", desc: "Code C# alertant le processeur central d'une surtension de batterie Singularity." }
      ],
      en: [
        { title: "Aberration Indicators", desc: "Chromatic HUD distortion shader triggering near spectral energy anomalies." },
        { title: "Built-in CLI Panel", desc: "Retro terminal displaying real-time Site-7 confinement logs." },
        { title: "Overload Diagnostics", desc: "C# script signaling Singularity battery core power spikes to the CPU." }
      ]
    },
    specs: [
      { label: { fr: "Moteur", en: "Engine" }, value: "Unity 2022.3 LTS" },
      { label: { fr: "Architecture UI", en: "UI Architecture" }, value: "UI Toolkit / XML Templates" },
      { label: { fr: "Shaders", en: "Shaders" }, value: "Custom HLSL / SRP Shader Graph" },
      { label: { fr: "FPS d'Exécution", en: "Grid Render FPS" }, value: "120 Hz thread lock" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600"
    ]
  },
  // 2. Player Improvements - Gaming Devlog
  "2": {
    features: {
      fr: [
        { title: "Suction directionnelle", desc: "Force vectorielle physique calculant l'aspiration des entity vers la buse du bras fait en softbody" },
        { title: "Déformation Soft-Body", desc: "Simulation des bras en jeu, collisions contre les joueur et les murs." },
        { title: "Écoulement Spectral", desc: "Shader de fluide simulant l'absorption de matière ectoplasmique dans le tube SVU." }
      ],
      en: [
        { title: "Directional Suction", desc: "Physical vector force pulling intangible ghost objects toward the vacuum canister." },
        { title: "Soft-Body Distortion", desc: "Vertex deformation shrinking ghost meshes proportionally to suction speed." },
        { title: "Spectral Fluid Shader", desc: "Custom vertex liquid shader simulating ectoplasm sliding inside the SVU hose." }
      ]
    },
    specs: [
      { label: { fr: "Algorithme d'Aspiration", en: "Suction Algorithm" }, value: "Centripetal force vector field" },
      { label: { fr: "Déformateur de Maillage", en: "Deformer Component" }, value: "Dynamic vertex offset shader" },
      { label: { fr: "Itérations Physiques", en: "Max Physics Iterations" }, value: "8 substeps per frame" },
      { label: { fr: "Gestion des Collisions", en: "Collision Mode" }, value: "Continuous mesh collision" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600",
      "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=600"
    ]
  },
  // 3. Multiplayer - Gaming Devlog
  "3": {
    features: {
      fr: [
        { title: "Arbres de Comportement", desc: "Prise de décision IA poussée : embuscade dans l'ombre et fuite face aux rayons UV." },
        { title: "Absorption d'Électricité", desc: "Les Poltergeists absorbent le courant des relais électriques pour doubler leur taille." },
        { title: "Discrétion Sensorielle", desc: "Calcul acoustique et visuel pour détecter les bruits de chenilles du robot." }
      ],
      en: [
        { title: "Behavior Trees", desc: "Complex decision algorithms: stealth hiding in vents and running away from UV beams." },
        { title: "Power Siphoning", desc: "Poltergeist entities siphoning live generators to increase physical size and damage." },
        { title: "Sensory Detection", desc: "Raycasted acoustic and optical detection fields reacting to robot tread noise." }
      ]
    },
    specs: [
      { label: { fr: "Architecture de l'IA", en: "AI Architecture" }, value: "Behavior Designer / Node Trees" },
      { label: { fr: "Système de Pathfinding", en: "Pathfinding System" }, value: "Unity NavMesh / Local Avoidance" },
      { label: { fr: "Fréquence de Mise à Jour", en: "Detection Update Rate" }, value: "5 ticks per second" },
      { label: { fr: "États d'Alerte", en: "Threat States" }, value: "Idle, Patrol, Investigate, Ambush, Escape" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600"
    ]
  },
  // 4. Core Loop - Gaming Devlog
  "4": {
    features: {
      fr: [
        { title: "Adhérence Réaliste", desc: "Courbes de friction dépendant de la rugosité du sol d'Extraction du Site-7." },
        { title: "Trous Noirs d'Énergie", desc: "Puits d'attraction gravitationnelle générés par les piles Singularity défaillantes." },
        { title: "Dash Régulé", desc: "Esquive rapide consommant 15% d'accumulateurs pour forcer la gestion de ressources." }
      ],
      en: [
        { title: "Authentic Friction", desc: "Locomotion curves reacting to Site-7 floor material roughness coefficients." },
        { title: "Gravitational Wells", desc: "Radial micro-attractors spawning upon ghost containment collapse." },
        { title: "Cell-Dampened Dash", desc: "Dash maneuver consuming 15% of battery storage, balancing speed and utility." }
      ]
    },
    specs: [
      { label: { fr: "Modèle de Traction", en: "Traction Model" }, value: "Custom Rigidbody Friction" },
      { label: { fr: "Coefficients de Traînée", en: "Drag Type" }, value: "Exponential drag coefficient" },
      { label: { fr: "Attraction Gravitationnelle", en: "Gravitational Falloff" }, value: "Inverse-square distance law" },
      { label: { fr: "Temps de Recharge Dash", en: "Dash Cooldown" }, value: "1.2s strict lock" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600"
    ]
  },
  // 5. 3D modeling - Gaming Devlog
  "5": {
    features: {
      fr: [
        { title: "Extraction de Batterie", desc: "Compression de l'énergie des entités capturées sous forme de bloc solide." },
        { title: "Port d'Objets", desc: "Transport physique des piles Singularity avec gestion du poids sur l'accélération." },
        { title: "Bornes d'Alimentation", desc: "Activation de circuits logiques pour ouvrir les portes blindées du campus." }
      ],
      en: [
        { title: "Core Extraction", desc: "Compacting captured entities inside terminals to create solid Singularity blocks." },
        { title: "Physical Carrying", desc: "Battery weight impacting robot maximum speed and tread turn rate." },
        { title: "Power Distributors", desc: "Logic grid sockets requiring batteries to restore power to Site-7 security gates." }
      ]
    },
    specs: [
      { label: { fr: "Cycle Principal", en: "Gameplay Loop" }, value: "Capture -> Extract -> Slot -> Unlock" },
      { label: { fr: "Système de Déclencheurs", en: "Logic System" }, value: "Event-driven boolean trigger network" },
      { label: { fr: "Capacité Batterie", en: "Battery Capacity" }, value: "1 block per socket" },
      { label: { fr: "Terminaux d'Outrepassement", en: "Override Terminals" }, value: "4 per sector" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
      "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=600",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600"
    ]
  },
  // 21. DKP Rénovation - Website
  "21": {
    externalUrl: "https://dkp95.fr",
    features: {
      fr: [
        { title: "Vitrine & Branding BTP", desc: "Design épuré et élégan aux teintes crème & dorées avec typographies Playfair Display et Plus Jakarta Sans." },
        { title: "Formulaire de Devis Interactif", desc: "Système de demande de devis sur mesure sous 24h avec sélection de prestations (Résidentiel, Tertiaire, Commerces) et intégration Google API." },
        { title: "Galerie de Réalisations & Chantiers", desc: "Présentation haute résolution des chantiers avec filtres par catégorie de travaux et optimisation d'affichage responsive." },
        { title: "Conformité RGPD & Analytics GA4", desc: "Gestion des consentements utilisateurs (Consent Mode v2) et en-têtes de sécurité OWASP." }
      ],
      en: [
        { title: "BTP Branding & Showcase", desc: "Sophisticated cream & gold aesthetic featuring Playfair Display and Plus Jakarta Sans typography." },
        { title: "Interactive Quote System", desc: "Tailored 24h estimate request module with service selection (Residential, Office, Retail) and Google API integration." },
        { title: "Project & Site Gallery", desc: "High-resolution showcase of renovation projects with categorical filters and responsive image delivery." },
        { title: "GDPR Consent & GA4 Analytics", desc: "User consent management (Consent Mode v2) and strict OWASP security headers." }
      ]
    },
    specs: [
      { label: { fr: "Site Officiel Live", en: "Live Website" }, value: "https://dkp95.fr" },
      { label: { fr: "Framework", en: "Framework" }, value: "React & Vite" },
      { label: { fr: "Design & Style", en: "Styling" }, value: "Tailwind CSS & Framer Motion" },
      { label: { fr: "APIs & Formulaires", en: "APIs & Forms" }, value: "Google Maps API & Mailer" },
      { label: { fr: "Score de Performance", en: "Speed Score" }, value: "99/100 Lighthouse" }
    ],
    gallery: [
      "/uploads/dkp95_hero.webp",
      "/uploads/dkp95_services.webp",
      "/uploads/dkp95_contact.webp",
      "/uploads/dkp95_chantier1.webp",
      "/uploads/dkp95_chantier2.webp"
    ]
  }
};
