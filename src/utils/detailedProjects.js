/**
 * Detailed extra data for portfolio projects
 * Contains rich features list, technical specifications, and photo gallery mockups.
 */
export const detailedProjects = {
  // 1. HUD - Gaming Devlog
  "1": {
    features: {
      fr: [
        { title: "Indicateurs Dynamiques", desc: "Barres de vie et de bouclier animées par shaders de distorsion chromatique." },
        { title: "Invite de Commandes Intégrée", desc: "Terminal interactif Kali Linux affiché en direct pour l'immersion système." },
        { title: "Rétroaction Haptique & Visuelle", desc: "Secousse d'écran directionnelle et flash d'ATH lors des impacts reçus." }
      ],
      en: [
        { title: "Dynamic Indicators", desc: "Shield and health bars animated using custom chromatic aberration shaders." },
        { title: "Integrated CLI Prompt", desc: "Interactive live Kali Linux terminal console for deep cyberpunk atmosphere." },
        { title: "Visual & Haptic Feedback", desc: "Directional screen shakes and HUD chromatic flashes upon receiving damage." }
      ]
    },
    specs: [
      { label: { fr: "Moteur", en: "Engine" }, value: "Unity 2022.3 LTS" },
      { label: { fr: "Pipeline de Rendu", en: "Render Pipeline" }, value: "HDRP (High Definition)" },
      { label: { fr: "Système d'UI", en: "UI System" }, value: "Unity UI Toolkit & UI Builder" },
      { label: { fr: "FPS d'Exécution UI", en: "UI Execution FPS" }, value: "144 Hz cap locked" }
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
        { title: "Physique du Dash", desc: "Impulsion vectorielle horizontale avec atténuation par courbe exponentielle." },
        { title: "Double Saut Inertiel", desc: "Conservation du moment angulaire et de l'accélération latérale lors du second saut." },
        { title: "Caméra Oscillante", desc: "Oscillation de tête (head bobbing) calée sur la vitesse de déplacement du joueur." }
      ],
      en: [
        { title: "Dash Physics", desc: "Horizontal vector impulse dampened using customizable exponential curves." },
        { title: "Inertial Double Jump", desc: "Conservation of angular momentum and lateral acceleration on the second jump." },
        { title: "Head Bobbing Cam", desc: "Dynamic head bobbing frequency synchronized to the player's movement speed." }
      ]
    },
    specs: [
      { label: { fr: "Type de Controller", en: "Controller Type" }, value: "Custom Rigidbody Controller" },
      { label: { fr: "Gestionnaire Anim", en: "Anim Manager" }, value: "Playables API & Animator States" },
      { label: { fr: "Physique", en: "Physics" }, value: "Discrete Continuous Collision Detection" },
      { label: { fr: "Fréquence Tick", en: "Fixed Update Tick" }, value: "60 Hz / 16.6ms" }
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
        { title: "Prédiction Client", desc: "Calcul immédiat des actions en local avec correction en arrière-plan par l'état serveur." },
        { title: "Compensation du Lag", desc: "Rembobinage de la boîte de collision (Rewind) pour évaluer les tirs dans le passé." },
        { title: "Réconciliation d'État", desc: "Correction fluide de la position client en cas d'écart réseau supérieur à 5cm." }
      ],
      en: [
        { title: "Client Prediction", desc: "Immediate execution of local actions with backend validation by the server authority." },
        { title: "Lag Compensation", desc: "Server hit-box rewinding mechanism to evaluate projectile hits in the past." },
        { title: "State Reconciliation", desc: "Smooth client translation correction in case of network drift above 5cm." }
      ]
    },
    specs: [
      { label: { fr: "Framework Réseau", en: "Network Framework" }, value: "Mirror Netcode" },
      { label: { fr: "Protocole", en: "Protocol" }, value: "UDP with custom reliable channels" },
      { label: { fr: "Taux d'Envoi", en: "Server Send Rate" }, value: "30 ticks/sec" },
      { label: { fr: "Interpolation", en: "Interpolation Buffer" }, value: "100ms standard offset" }
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
        { title: "Machine à États Finis", desc: "Cycle de jeu unifié : En attente, Échauffement, En cours, Mort subite, Fin de round." },
        { title: "Spawn Intelligent", desc: "Algorithme d'évaluation de distance pour éviter le spawn de joueurs en ligne de mire." },
        { title: "Statistiques en Direct", desc: "Calcul en temps réel du Ratio K/D et classement ordonné des joueurs." }
      ],
      en: [
        { title: "Finite State Machine", desc: "Decoupled game stages flow: Waiting, Warmup, Active, Sudden Death, Round End." },
        { title: "Smart Spawner", desc: "Raycasted distance evaluation algorithm avoiding spawning players in direct sight." },
        { title: "Live Leaderboard", desc: "Real-time computation of K/D ratio and ordered player scoreboards." }
      ]
    },
    specs: [
      { label: { fr: "Architecture", en: "Architecture" }, value: "Event-Driven State Machine" },
      { label: { fr: "Type de match", en: "Match Type" }, value: "Free For All / Deathmatch" },
      { label: { fr: "Persistance", en: "Persistence" }, value: "Local SQLite / JSON backup" },
      { label: { fr: "Max Joueurs", en: "Max Players" }, value: "16 players per lobby" }
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
        { title: "Optimisation de Topologie", desc: "Retopologie manuelle sous Blender pour conserver moins de 15 000 polygones par robot." },
        { title: "Texturage PBR Réaliste", desc: "Cartes d'usure, de rouille et de peinture cuite au four exportées en 4K." },
        { title: "Shaders de Rayures", desc: "Shader Unity HDRP de dommages procéduraux dépendant des collisions réelles subies." }
      ],
      en: [
        { title: "Topology Optimization", desc: "Manual retopology in Blender maintaining less than 15,000 polygons per robot." },
        { title: "Realistic PBR Texturing", desc: "4K baked normal, roughness, metallic, and rusted edge wear maps." },
        { title: "Dynamic Scratch Shader", desc: "Custom Unity HDRP shader generating procedural paint scratches from physical impacts." }
      ]
    },
    specs: [
      { label: { fr: "Logiciel de Modélisation", en: "Modeling Tool" }, value: "Blender 3.6 LTS" },
      { label: { fr: "Logiciel de Textures", en: "Texturing Tool" }, value: "Substance Painter 3D" },
      { label: { fr: "Résolution Textures", en: "Texture Resolution" }, value: "4096 x 4096 px" },
      { label: { fr: "Système de Squelette", en: "Rigging Framework" }, value: "Custom IK Rig with Rigify" }
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
