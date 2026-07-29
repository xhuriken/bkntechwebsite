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
  // 6. SaaS Dashboard - Website
  "6": {
    features: {
      fr: [
        { title: "Flux WebSockets Fluides", desc: "Mise en mémoire tampon des données boursières à haute fréquence (250 ticks/sec)." },
        { title: "Graphes Vectoriels D3.js", desc: "Rendu SVG interactif de courbes de chandeliers et d'analyses de tendances." },
        { title: "Mise en cache Locale", desc: "Stockage mémoire volatile optimisé pour éviter les lenteurs de re-rendu React." }
      ],
      en: [
        { title: "Buffered WebSockets", desc: "Buffer queuing mechanism for high-frequency stock feeds (up to 250 ticks/sec)." },
        { title: "D3.js Vector Visuals", desc: "Interactive SVG financial charts showing candlestick curves and MACD indicators." },
        { title: "Local State Caching", desc: "Memory cache avoiding unnecessary React components re-renders on live tick streams." }
      ]
    },
    specs: [
      { label: { fr: "Framework Client", en: "Client Framework" }, value: "React 19 + Vite" },
      { label: { fr: "Rendu Graphique", en: "Chart Renderer" }, value: "D3.js / SVG Layer" },
      { label: { fr: "Gestion de Flux", en: "Feed Ingestion" }, value: "WebSockets + RxJS Buffering" },
      { label: { fr: "Lighthouse Performance", en: "Lighthouse Perf" }, value: "98 / 100" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600"
    ]
  },
  // 9. E-Commerce Headless - Website
  "9": {
    features: {
      fr: [
        { title: "Rendu Hybride SSG/ISR", desc: "Génération statique des fiches produits avec rafraîchissement incrémental (ISR) toutes les 60s." },
        { title: "Paiements Sécurisés Stripe", desc: "Tunnel de commande Stripe Checkout sécurisé avec gestion automatique des webhooks." },
        { title: "Panier Local Optimisé", desc: "Persistance et synchronisation silencieuse du panier utilisateur via Zustand." }
      ],
      en: [
        { title: "Hybrid SSG/ISR Rendering", desc: "Static generation of catalog pages with incremental static regeneration (ISR) every 60s." },
        { title: "Secure Stripe Payments", desc: "Fully integrated Stripe Checkout flow with background webhooks verification." },
        { title: "Optimized Zustand Cart", desc: "State persistence and silent API synchronization using Zustand." }
      ]
    },
    specs: [
      { label: { fr: "Framework Principal", en: "Core Framework" }, value: "Next.js 14 App Router" },
      { label: { fr: "API Query Language", en: "API Query Language" }, value: "GraphQL + Apollo Client" },
      { label: { fr: "Passerelle Paiement", en: "Payment Provider" }, value: "Stripe API SDK" },
      { label: { fr: "CMS de Contenu", en: "CMS Provider" }, value: "Strapi Headless CMS" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=600",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600"
    ]
  },
  // 10. Real-time Board - Website
  "10": {
    features: {
      fr: [
        { title: "Résolution de Conflits CRDT", desc: "Algorithme Yjs assurant la fusion des tracés dessinés sans écrasement." },
        { title: "Signalisation WebRTC Mesh", desc: "Connexion peer-to-peer décentralisée directe entre les onglets utilisateurs." },
        { title: "Interpolation Vectorielle", desc: "Adoucissement de courbes par spline de Bézier pour l'affichage fluide des tracés." }
      ],
      en: [
        { title: "CRDT Conflict Resolution", desc: "Yjs document syncing engine ensuring zero data loss during simultaneous drawing." },
        { title: "WebRTC Mesh Network", desc: "Direct peer-to-peer connection bypasses servers, reducing lag to zero." },
        { title: "Bezier Spline Smoothing", desc: "Real-time mouse path vector interpolation for silky-smooth drawings." }
      ]
    },
    specs: [
      { label: { fr: "Moteur de Tracé", en: "Drawing Engine" }, value: "HTML5 Canvas 2D Context" },
      { label: { fr: "Algorithme Sync", en: "Sync Algorithm" }, value: "Yjs CRDT Document model" },
      { label: { fr: "Transport Réseau", en: "Network Layer" }, value: "SimplePeer WebRTC Wrapper" },
      { label: { fr: "Lighthouse Performance", en: "Lighthouse Perf" }, value: "99 / 100" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600"
    ]
  },
  // 7. Anti-Spam PoW Agent - AI Agent
  "7": {
    features: {
      fr: [
        { title: "CalculSHA-256 Asynchrone", desc: "Exécution du défi cryptographique local dans un Web Worker séparé." },
        { title: "Signature Cryptographique", desc: "Signature du jeton de réussite par clé asymétrique côté serveur." },
        { title: "Honeypot Silencieux", desc: "Champs invisibles détectant les robots pour piéger et rejeter immédiatement l'envoi." }
      ],
      en: [
        { title: "Async SHA-256 Solving", desc: "Cryptographic proof-of-work challenge solved inside background Web Workers." },
        { title: "Cryptographic Signature", desc: "Server-side asymmetrical token signature verifying validity before sending mail." },
        { title: "Silent Honeypot", desc: "Invisible trap fields identifying automated bot submissions instantly." }
      ]
    },
    specs: [
      { label: { fr: "Algorithme Défi", en: "Challenge Algorithm" }, value: "SHA-256 Cryptographic Loop" },
      { label: { fr: "Exécution Côté Client", en: "Client-side Execution" }, value: "Web Workers API (Multi-thread)" },
      { label: { fr: "Temps de Résolution", en: "Solve Duration" }, value: "80ms - 150ms average" },
      { label: { fr: "Intégration", en: "Integration Level" }, value: "Form submission hook / CORS safe" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600"
    ]
  },
  // 11. AI Customer Support Agent (RAG) - AI Agent
  "11": {
    features: {
      fr: [
        { title: "Indexation Vectorielle", desc: "Découpage intelligent des notices d'entreprise et stockage dans Pinecone." },
        { title: "Semantic Guardrails", desc: "Rejet automatique des réponses de LLM dont le score de confiance sémantique est inférieur à 0.85." },
        { title: "Gestion de Contexte", desc: "Fenêtre glissante de jetons (Token Sliding Window) pour limiter le coût de l'API OpenAI." }
      ],
      en: [
        { title: "Vector Chunk Indexing", desc: "Semantic splitting of business documents stored as high-dimensional vectors in Pinecone." },
        { title: "Semantic Guardrails", desc: "Automated filtering of AI answers falling below a 0.85 cosine similarity score." },
        { title: "Context Windowing", desc: "Sliding token window API managing history to minimize OpenAI token consumption." }
      ]
    },
    specs: [
      { label: { fr: "Framework d'Orchestration", en: "Orchestration Tool" }, value: "LangChain Framework" },
      { label: { fr: "Modèle LLM", en: "LLM Model" }, value: "GPT-4o / Claude 3.5 Sonnet" },
      { label: { fr: "Base Vectorielle", en: "Vector Database" }, value: "Pinecone Cloud DB" },
      { label: { fr: "Vitesse d'Inférence", en: "Inference Speed" }, value: "45 tokens/sec" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=600",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"
    ]
  },
  // 12. AI DevOps Refactoring Agent - AI Agent
  "12": {
    features: {
      fr: [
        { title: "Parsing AST", desc: "Représentation du code source sous forme d'arbre de syntaxe pour repérer les vulnérabilités." },
        { title: "Génération de Patches Git", desc: "Production automatique de fichiers diff conformes à la norme POSIX pour application immédiate." },
        { title: "Fine-Tuning de Modèle", desc: "Modèle Llama 3 entraîné spécifiquement sur le code source de l'entreprise." }
      ],
      en: [
        { title: "AST Parsing Analysis", desc: "Abstract Syntax Tree inspection of source code files to locate architectural bugs." },
        { title: "POSIX Diff Output", desc: "Generation of code patches compliant with standard git diff format." },
        { title: "Fine-tuned Model", desc: "Company code-style adapted Llama 3 fine-tuned parameters running locally." }
      ]
    },
    specs: [
      { label: { fr: "Logiciel d'Analyse", en: "AST Parser Engine" }, value: "Babel Parser / Acorn" },
      { label: { fr: "Pipeline Intégration", en: "Integration Pipeline" }, value: "GitHub Actions Runner API" },
      { label: { fr: "Vitesse de Revue", en: "Review Processing Speed" }, value: "~12s per standard PR" },
      { label: { fr: "OWASP Coverage", en: "OWASP Coverage" }, value: "100% of injection targets" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600"
    ]
  },
  // 8. BKN Tracker Link - Mobile
  "8": {
    features: {
      fr: [
        { title: "Optimisation de Batterie", desc: "Réduction intelligente du taux d'interrogation GPS lorsque l'appareil est immobile." },
        { title: "Mode Hors-ligne Résilient", desc: "Stockage des coordonnées dans SQLite local en attente du retour de connexion." },
        { title: "Intégration Maps", desc: "Tracé fluide de l'itinéraire sur carte vectorielle Google Maps." }
      ],
      en: [
        { title: "Smart Battery Optimization", desc: "Adjusts GPS request frequency dynamically based on accelerometer state." },
        { title: "Offline Storage Queue", desc: "Local SQLite coords buffering queue awaiting network re-establishment." },
        { title: "Google Maps Trajectory", desc: "High-performance vector plotting of active delivery paths on maps." }
      ]
    },
    specs: [
      { label: { fr: "Framework Mobile", en: "Mobile Framework" }, value: "Flutter SDK 3.19" },
      { label: { fr: "Langage", en: "Language" }, value: "Dart" },
      { label: { fr: "Base de Données Locale", en: "Local Cache DB" }, value: "SQLite / Sqflite" },
      { label: { fr: "Consommation CPU", en: "CPU & Battery Overhead" }, value: "Less than 1.5% battery per hour" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600",
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=600",
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600"
    ]
  },
  // 13. Fitness Coach Interactif - Mobile
  "13": {
    features: {
      fr: [
        { title: "Calcul de Pose TensorFlow", desc: "Estimation en temps réel des coordonnées articulaires par la caméra." },
        { title: "Analyse Angulaire", desc: "Vérification de l'angle du coude/genou pour compter les répétitions de squats." },
        { title: "Anonymat Complet", desc: "Aucun flux vidéo n'est envoyé sur internet, tout est traité sur l'appareil." }
      ],
      en: [
        { title: "TensorFlow Pose Estimation", desc: "Real-time keypoint extraction of joints from local camera stream." },
        { title: "Angular Evaluation", desc: "Trigonometric verification of elbow/knee joint angles for counting repetitions." },
        { title: "Privacy By Design", desc: "All frame processing occurs inside local memory; no videos are sent to the cloud." }
      ]
    },
    specs: [
      { label: { fr: "Framework Hybride", en: "Hybrid Framework" }, value: "React Native + Expo" },
      { label: { fr: "Moteur IA", en: "IA Run Engine" }, value: "TensorFlow Lite SDK" },
      { label: { fr: "FPS d'Analyse Pose", en: "Pose Processing FPS" }, value: "30 FPS on average hardware" },
      { label: { fr: "Langage", en: "Language" }, value: "TypeScript" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600"
    ]
  },
  // 14. Wallet Multi-Chaînes Sécurisé - Mobile
  "14": {
    features: {
      fr: [
        { title: "Authentification Biométrique", desc: "Exigence de TouchID / FaceID avant toute transaction ou signature." },
        { title: "Multi-Party Computation (MPC)", desc: "Calcul de signature à partir d'éclats de clés disjoints pour éviter la perte." },
        { title: "Secure Enclave Core", desc: "Stockage physique des secrets cryptographiques protégés par le matériel." }
      ],
      en: [
        { title: "Biometric Authentication", desc: "Direct hardware prompt for TouchID / FaceID prior to any signature request." },
        { title: "MPC Signature", desc: "Multi-party cryptographic signature utilizing separated local key splits." },
        { title: "Secure Enclave Core", desc: "Hardware isolation enclave keys encryption mapping." }
      ]
    },
    specs: [
      { label: { fr: "Framework Principal", en: "Core Framework" }, value: "Flutter SDK" },
      { label: { fr: "Stockage Physique", en: "Hardware Storage Enclave" }, value: "Biometric Secure Enclave / KeyStore" },
      { label: { fr: "Cryptage", en: "Encryption Protocol" }, value: "AES-256-GCM + Secp256k1" },
      { label: { fr: "Réseaux Blockchain", en: "Blockchain Networks" }, value: "Ethereum, Polygon, Arbitrum" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600",
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=600",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600"
    ]
  }
};
