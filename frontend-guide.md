# Guide d'Intégration Frontend — Style & Composants ReviewMe

Ce document sert de spécification technique pour reproduire la charte graphique et les composants premium du projet sur un autre site.

---

## 1. Fondations & Variables CSS (Tokens)

Toute la charte graphique repose sur une palette sombre premium et des typographies modernes importées.

### Import des polices & configuration des variables CSS (`tokens.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap');

:root {
    /* Palette sombre du projet */
    --surface: #12131b;
    --surface-bright: #383842;
    --surface-dim: #12131b;
    --surface-variant: #33343d;
    --surface-container-lowest: #0d0e16;
    --surface-container-low: #1a1b23;
    --surface-container: #1e1f28;
    --surface-container-high: #292932;
    --surface-container-highest: #33343d;
    
    /* Accents colorés */
    --primary: #bec2ff;           /* Indigo-Bleu brillant */
    --primary-container: #5b63d3; /* Indigo foncé */
    --secondary: #4edea3;         /* Vert Menthe */
    --secondary-container: #00a572;
    --tertiary: #ffb95f;          /* Or Ambré */
    --tertiary-container: #9c6200;
    
    --on-surface: #e3e1ed;
    --on-surface-variant: #ababcf;
    --on-primary: #000000;
    
    --outline: #908f9e;
    --outline-variant: #454653;
    
    /* Transitions fluides */
    --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --transition-instant: 100ms var(--ease-standard);
    --transition-fast: 150ms var(--ease-standard);
    --transition-base: 300ms var(--ease-standard);
}

body {
    background-color: var(--surface);
    color: var(--on-surface);
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
}

/* Typographie d'affichage */
.font-display {
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.04em;
}

/* Effet de panneau en verre */
.glass-panel {
    background: rgba(12, 13, 18, 0.85);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(190, 194, 255, 0.15);
    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
}
```

---

## 2. Arrière-plan Interactif (`InteractiveGrid`)

L'arrière-plan du site est un maillage géométrique interactif qui réagit à la position de la souris de l'utilisateur grâce à Alpine.js.

```html
<div 
    x-data="{ 
        mouseX: 0, 
        mouseY: 0,
        updateMouse(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            document.body.style.setProperty('--mouse-x', this.mouseX + 'px');
            document.body.style.setProperty('--mouse-y', this.mouseY + 'px');
        }
    }"
    @mousemove.window="updateMouse($event)"
    class="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    aria-hidden="true"
>
    <!-- Trame de fond statique subtile -->
    <div class="absolute inset-0 opacity-[0.25]" style="background-image: radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0); background-size: 32px 32px;"></div>

    <!-- Grille réactive se déplaçant sous la souris -->
    <svg class="absolute inset-0 w-full h-full text-primary" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="lens-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.4" />
                <circle cx="0" cy="0" r="2.5" fill="currentColor" fill-opacity="0.8" />
            </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#lens-grid)" 
              style="mask-image: radial-gradient(circle 300px at var(--mouse-x, 0) var(--mouse-y, 0), black 0%, transparent 100%);
                     -webkit-mask-image: radial-gradient(circle 300px at var(--mouse-x, 0) var(--mouse-y, 0), black 0%, transparent 100%);" />
    </svg>
    
    <!-- Halo lumineux ambiant sous la souris -->
    <div class="absolute inset-0 opacity-20"
         style="background: radial-gradient(circle 600px at var(--mouse-x, 0) var(--mouse-y, 0), rgba(190, 194, 255, 0.1), transparent 100%);">
    </div>
</div>
```

---

## 3. Bouton Premium Magnétique (`Button`)

Ce bouton dispose d'un effet d'attraction magnétique au survol, d'un changement d'arrondi dynamique et d'une texture de bruit.

```html
<!-- Exemple de bouton principal (adaptable en tag <a> ou <button>) -->
<button 
    x-data="{ 
        atX: 0, 
        atY: 0,
        txX: 0,
        txY: 0,
        attract(e) {
            const rect = $el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.atX = (e.clientX - centerX) * 0.05;
            this.atY = (e.clientY - centerY) * 0.05;
            this.txX = (e.clientX - centerX) * -0.1;
            this.txY = (e.clientY - centerY) * -0.1;
        },
        reset() {
            this.atX = 0;
            this.atY = 0;
            this.txX = 0;
            this.txY = 0;
        }
    }"
    x-on:mousemove="attract($event)"
    x-on:mouseleave="reset()"
    :style="`transform: translate(${atX}px, ${atY}px)`"
    class="inline-flex items-center justify-center font-display font-black transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group active:scale-95 border uppercase tracking-[0.15em] select-none rounded-[100px] hover:rounded-none px-6 py-2.5 text-[10px] bg-primary text-black font-black border-primary/20 hover:border-primary shadow-[0_0_20px_rgba(190,194,255,0.2)] hover:shadow-[0_0_40px_rgba(190,194,255,0.4)]"
>
    <!-- Texture de bruit subtile -->
    <div class="absolute inset-0 opacity-20 pointer-events-none" 
         style="background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E'); background-blend-mode: soft-light;"></div>
    
    <!-- Grille de fond qui réagit au survol -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none overflow-hidden rounded-[inherit]">
        <div class="absolute inset-[-100%] transition-transform duration-200 ease-out"
             :style="`transform: translate(${txX}px, ${txY}px) scale(1.2); background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 16px 16px;`"></div>
    </div>
    
    <!-- Contenu du bouton (icône et texte) -->
    <span class="relative z-10 flex items-center gap-3">
        <i class="fas fa-plus text-xs"></i>
        Post Review
    </span>
</button>
```

---

## 4. Commutateur de Langue Interactif (`LanguageSwitcher`)

Un bouton de basculement ultra-lisse avec un indicateur lumineux qui glisse physiquement d'une option à l'autre.

```html
<div class="relative flex items-center p-1 bg-surface-container-low/50 rounded-xl border border-white/5 backdrop-blur-md"
     x-data="{ locale: 'fr' }">
    
    <!-- Calque de surbrillance coulissant -->
    <div class="absolute inset-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-primary rounded-lg shadow-[0_0_20px_rgba(190,194,255,0.25)]"
         :class="locale === 'fr' ? 'translate-x-0 w-8' : 'translate-x-[36px] w-8'">
    </div>
    
    <div class="flex items-center gap-1">
        <a href="#" 
           @click.prevent="locale = 'fr'"
           class="relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300"
           :class="locale === 'fr' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'">
           FR
        </a>
        <a href="#" 
           @click.prevent="locale = 'en'"
           class="relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300"
           :class="locale === 'en' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'">
           EN
        </a>
    </div>
</div>
```

---

## 5. Effet Hover Navbar (`NavLink`)

Les liens textuels de la navbar s'animent en révélant une ligne inférieure s'étendant à 100% de la largeur du lien.

```html
<a href="#" 
   class="relative group/link py-2 font-display font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 text-on-surface-variant hover:text-on-surface">
    Feed
    <!-- Ligne de soulignement animée -->
    <div class="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-full"></div>
</a>
```

---

## 6. Icônes et Directives Strictes

### Choix technologique pour les icônes
* Utiliser exclusivement la librairie **Font Awesome** en important la feuille de style CDN.
* Lien recommandé dans le `<head>` :
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  ```
* Exemple d'intégration : `<i class="fa-solid fa-plus"></i>`, `<i class="fa-solid fa-user"></i>`.

### Zéro Emoji
* **Règle absolue** : Aucun emoji ne doit être présent dans l'interface, les boutons ou la structure textuelle du site. Utiliser exclusivement les icônes vectorielles Font Awesome ou des formes géométriques pures.

---

## 7. Philosophie de Conception (SSOT & Composants)

1. **SSOT (Single Source of Truth)** :
   * Définir toutes les couleurs, temps de transition et typographies dans les tokens CSS centraux (`tokens.css`).
   * Éviter absolument de surcharger des classes Tailwind ou du CSS ad-hoc avec des valeurs arbitraires.
2. **Modularité des composants** :
   * Ne jamais dupliquer le style d'un bouton. Créer un composant réutilisable (par exemple un composant Blade ou un composant de framework moderne) et lui passer des attributs (`variant`, `size`, `href`).
   * Structurer l'ensemble des pages sous le même thème d'affichage sombre et géométrique en combinant le panneau en verre (`glass-panel`) et la grille réactive (`interactive-grid`).
