# Fitness App Prototype

_Started 2026-06-11 15:13 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "fitforge"
Project currently has 1 file(s)
Current date is now June 11, 2026
</system-info>

<default aesthetic_system_instructions>
The user has not attached a design system. If they have ALSO not attached references or art direction, and the project is empty, you must ASK the user what visual aesthetic they want. Use the questions_v2 tool to ask about preferred vibe, audience, colors, type, mood, etc. Do NOT just pick your own visual aesthetic without getting the user's aesthetic input -- this is how you get slop!

Once answered, use this guidance when creating designs:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic_system_instructions>

<attached_files>
- uploads/Plan muscu 3 mois.pdf
</attached_files>

<pasted_text name="Pasted text (404 lines)">
PROMPT : FitForge — Application de Musculation Personnalisée
Expérience Utilisateur Premium | UI/UX Award-Level
🎯 VISION PRODUIT
Crée FitForge, une application web PWA de musculation qui redéfinit l'expérience d'entraînement.
Ce n'est pas une app de tracking banale — c'est un compagnon d'entraînement immersif qui transforme chaque séance en expérience fluide, motivante et visuellement saisissante.
Ambiance : Salle de sport premium à 5h du matin. Néons froids, acier brossé, silence concentré.
L'interface doit respirer la puissance calme — pas de chaos visuel, chaque pixel a un sens.
🎨 DESIGN SYSTEM — "Obsidian Forge"
Palette (Dark Mode Obligatoire)
plain
Background Primary   : #050505 (noir absolu, pas de gris bleuté)
Background Secondary : #0F0F0F (cartes, panels)
Background Tertiary  : #1A1A1A (hover states, inputs)
Accent Primary       : #00F0FF (cyan néon — énergie, actions principales)
Accent Secondary     : #FF3D71 (rose/corail — intensité, records, alertes)
Accent Tertiary      : #39FF14 (vert néon — succès, validation, progression)
Text Primary         : #FFFFFF
Text Secondary       : #8A8A8A
Text Tertiary        : #4A4A4A
Border/Divider       : #1F1F1F (subtil, presque invisible)
Glass Effect         : rgba(15, 15, 15, 0.85) + backdrop-blur(20px)
Typographie
Titres/Chiffres : "Space Grotesk" ou "Bebas Neue" — géométrique, impactant
Corps : "Inter" — lisible, neutre, professionnel
Monospace (poids, reps, timers) : "JetBrains Mono" — lecture instantanée
Scale : 12px (labels) → 16px (body) → 24px (h3) → 48px (h1/timer) → 96px (chiffres hero)
Effets Visuels Clés
Glow néon : box-shadow: 0 0 20px rgba(0, 240, 255, 0.15) sur les éléments actifs
Gradients linéaires : jamais de gradients flashy. Uniquement subtle gradients (ex: #0F0F0F → #050505)
Glassmorphism : utilisé avec parcimonie pour les modals et overlays
Micro-interactions : chaque bouton a un feedback haptique visuel (scale 0.97 + glow au click)
Animations : Framer Motion — spring physics, pas de linear fades. Entrées par le bas, exits par le haut.
Layout Philosophy
Mobile First (70% d'usage en salle)
One-Handed Friendly : tous les CTAs dans le thumb zone (bas de l'écran)
Zero Clutter : pas de navbar permanente. Navigation gestuelle (swipe) ou bottom sheet.
Full Bleed : les images et les hero sections vont jusqu'aux bords
🏗️ ARCHITECTURE TECHNIQUE
plain
Stack : React 18 + TypeScript + Vite
Styling : Tailwind CSS + Framer Motion + GSAP (pour les animations complexes)
State : Zustand (stores modulaires : auth, workout, progress, settings)
DB Local : Dexie.js (IndexedDB wrapper) — offline first
PWA : Vite PWA Plugin, service worker personnalisé pour cache images et workouts
Icons : Phosphor Icons (stroke style, cohérent avec l'esthétique minimaliste)
📱 FLOWS &amp; SCREENS
1. SPLASH &amp; ONBOARDING (First Launch)
Splash Screen
Logo FitForge animé (SVG stroke animation — le logo se "dessine" en 1.5s)
Tagline : "Forge Your Body." (fade in après le logo)
Transition vers onboarding via un "iris wipe" (cercle qui s'ouvre depuis le logo)
Onboarding (3 étapes, horizontal scroll snap)
Step 1 — Qui es-tu ?
Input nom avec auto-focus et clavier virtuel stylisé
Sélecteur sexe : 2 grandes tuiles (Homme/Femme) avec icônes géométriques
Date de naissance : wheel picker (pas de calendrier moche)
Step 2 — Ton corps
Sliders magnétiques pour poids et taille (haptic feedback visuel)
Sélecteur d'objectif : 3 cards avec preview visuel (silhouette qui change)
💪 Prise de muscle (silhouette qui s'épaissit)
🔥 Perte de gras (silhouette qui se définit)
⚖️ Maintien (silhouette stable)
Step 3 — Ton équipement
Grid d'icônes toggle (salle, haltères, élastiques, poids du corps, rien)
Plus tu sélectionnes, plus le programme s'adapte
CTA final : "Générer mon programme" — bouton plein largeur, glow cyan au hover
Transition vers Dashboard
Loading state : animation de "forging" (barre de métal qui se forge en barre de musculation)
2-3 secondes de suspense, puis reveal du dashboard
2. DASHBOARD (Home)
Header (collapsible)
Avatar minimaliste (initiales dans un cercle avec glow subtil)
Nom de l'utilisateur + streak de jours (flamme animée si streak &gt; 3)
Date du jour en texte secondaire
Hero Section — "Séance du Jour"
Card massive (85% de la largeur, centrée) avec background image floutée de l'exercice principal
Overlay gradient sombre
Titre de la séance (ex: "Haut du Corps — Carrure")
Badge de durée estimée + nombre d'exercices
Bouton "DÉMARRER" : plein largeur, hauteur 56px, background cyan néon, texte noir gras
Au repos : pulse subtil (scale 1.02 toutes les 3s)
Au tap : ripple effect + scale down 0.95
Calendrier Horizontal (Scrollable)
7 jours visibles, aujourd'hui en surbrillance cyan
Jours passés : petit check vert si complété, croix discrète si manqué
Jours futurs : outline subtil
Swipe horizontal fluide (snap to day)
Section "Cette Semaine"
4 barres verticales (L/M/M/V/D/D/S) — style graphique minimaliste
Hauteur = completion %, couleur = vert si 100%, orange si partiel, gris si futur
Label en dessous : "3/4 séances cette semaine"
Section "Progression" (Horizontal Scroll)
Cards avec métriques clés :
Volume total cette semaine (kg × reps) — chiffre gros, monospace
PR récent (dernier record battu) — badge "NEW" qui pulse
Poids corporel — courbe sparkline (mini graphique)
Consistance mensuelle — heatmap (comme GitHub contributions)
Bottom Navigation (Hidden par défaut, swipe up pour révéler)
4 items : Dashboard | Programme | Journal | Profil
Icônes stroke, active = fill + glow
Pas de labels (icon-only pour économiser l'espace)
3. SÉANCE EN COURS (Workout Player) — LE CŒUR DE L'APP
Mode Immersif : tout l'écran est dédié à l'exercice actuel
Top Bar (fade out après 3s, tap pour réafficher)
Timer global de la séance (format MM:SS, monospace)
Bouton pause (||) et quitter (X) — icônes minimalistes
Progress bar fine (1px) en haut de l'écran, couleur cyan
Exercice Card (80% de l'écran)
Nom de l'exercice : H1, 32px, blanc
Muscle cible : badge subtil (ex: "Pectoraux" — fond #1A1A1A, texte #8A8A8A)
Image/GIF : plein écran derrière le texte, overlay gradient noir (60% opacité)
Swipe left/right pour voir l'angle alternative de l'exercice
Série en cours : gros chiffre "SÉRIE 2/4" — 96px, monospace, cyan néon
Input des Reps &amp; Poids (Zone Thumb)
Layout horizontal : [Poids] [×] [Reps]
Poids : grand bouton + et - (48×48px) autour d'un chiffre éditable (tap pour clavier numérique)
Incrément intelligent : +2.5kg pour les gros lifts, +1kg pour isolations
Reps : même pattern, incrément de 1
RIR Selector : 5 petits cercles (0-4) alignés horizontalement
0 = rouge (échec), 1 = orange, 2-3 = vert, 4 = gris (trop facile)
Tap pour sélectionner, animation de remplissage
Timer de Repos (Automatique après validation série)
Overlay plein écran avec compte à rebours géant (120px)
Cercle SVG qui se réduit (progress ring)
Boutons rapides : "+15s" | "-15s" | "Skip"
Son subtil de "tick" à chaque seconde (optionnel, mute par défaut)
À 5s restantes : glow pulse + vibration (si supporté)
Suggestion intelligente en dessous : "Repos recommandé : 90s pour cet exercice"
Validation Série
Swipe up sur le bouton "VALIDER" (style Tinder — swipe pour confirmer)
OU bouton classique plein largeur avec animation de check
Après validation :
Flash blanc subtil (0.1s) pour marquer la transition
Exercice suivant glisse depuis la droite
Série précédente réduite en mini-card en haut (scrollable)
Séries Complétées (Mini-liste en haut, collapsible)
Ligne par série : "S1: 60kg × 10 @ RIR 2" — texte monospace, compact
Couleur : vert si RIR 1-2, orange si RIR 0, gris si RIR 3+
Bouton "Exercice Suivant / Terminer"
Fixed en bas, plein largeur
Si dernier exercice : devient "TERMINER LA SÉANCE" — background vert néon
Animation de confettis subtils (particules cyan/vert qui tombent)
Summary screen qui slide up
Mode "Superset" (si applicable)
Split screen 50/50 vertical
Exercice A en haut, Exercice B en bas
Timer de repos commun
Validation alternée (A → B → repos → A → B)
4. RÉCAP POST-SÉANCE (Summary Screen)
Hero Stats
Durée totale (MM:SS)
Volume total (kg) — chiffre massif, animation de comptage (0 → valeur en 1s)
Nombre de PRs battus
Calories estimées
Graphique d'Intensité
Courbe de l'intensité au fil du temps (basé sur le RIR moyen)
Zones colorées : vert (facile), orange (dur), rouge (échec)
Comparaison avec la dernière séance similaire
"vs Mercredi dernier" — flèche verte si meilleur volume, rouge si moins
Exercice par exercice : évolution du poids/reps
CTA
"Partager ma séance" — génère une image stylisée (format story Instagram, 9:16)
Template noir avec stats en gros, logo FitForge discret
"Retour au Dashboard" — slide down
5. PROGRAMME (Vue 12 Semaines)
Timeline Verticale
12 semaines, chacune est une section collapsible
Semaine actuelle : auto-expand, glow subtil sur le bord gauche
Jours de la semaine : 4 petits cards (L/M/V/D)
Complété : fond vert très subtil, check icon
Aujourd'hui : border cyan, pulse subtil
Futur : outline gris
Manqué : outline rouge très subtil
Vue Jour (Tap sur un jour)
Liste des exercices avec mini preview (GIF 50×50px)
Sets × Reps × Poids cible
Notes de l'utilisateur (editable)
Bouton "Démarrer cette séance" (si c'est aujourd'hui ou passé)
6. JOURNAL (Historique &amp; Analytics)
Header avec Filtres
Segmented control : Semaine | Mois | 3 Mois | Tout
Filtre par muscle : dropdown avec icônes anatomiques minimalistes
Graphiques Principaux
Volume hebdomadaire : bar chart, couleur cyan, animation au scroll
Progression des lifts clés : line chart multi-series (développé, squat, rowing, etc.)
Toggle par exercice (tap sur la légende)
Heatmap de consistance : grid 7×N (jours × semaines), couleur = intensité
Hover : tooltip avec détails de la séance
Liste des Séances Passées
Cards verticales, scrollable
Chaque card : date, titre, volume, durée, 3 meilleurs exercices
Tap pour expand → détail complet de la séance
Swipe left pour "Refaire cette séance" (copie dans aujourd'hui)
7. PROFIL &amp; CORPS
Section Photos
Grid 3×4 (face, profil gauche, profil droit, dos) × 3 mois
Tap pour comparer : slider before/after overlay
Camera intégrée : overlay de grille (règles des tiers) pour des photos cohérentes
Flash automatique selon la luminosité
Section Mensurations
Silhouette humaine interactive (SVG)
Tap sur une zone pour saisir la mesure
Graphique d'évolution pour chaque zone
Objectifs : ligne pointillée sur le graphique
Paramètres
Toggle Dark/Light (mais dark est défaut et recommandé)
Unités : kg/lbs, cm/in
Notifications : heures de rappel (séance, protéines, coucher)
Export données : JSON / CSV / PDF
Mode "Sans Distraction" : cache tout sauf l'exercice en cours
🧠 LOGIQUE &amp; INTELLIGENCE
Progression Automatique
plain
SI (reps &gt;= max_target) ET (RIR &lt;= 1) SUR 2 séances consécutives :
  → Notification : "Prêt pour +2.5kg ?"
  → Un tap pour appliquer la nouvelle charge
  → Exercice marqué d'un badge "UPGRADED"
Adaptation Dynamique
plain
SI 2 séances manquées dans la semaine :
  → Popup : "Raccourcir la séance d'aujourd'hui ?"
  → Proposition : version 30 min (moins d'isolation, focus composés)

SI douleur signalée sur un exercice :
  → Suggestion de 3 alternatives (même muscle, différent angle)
  → Note automatique dans le journal
Rappels Intelligents
1h avant séance : "Haut du corps dans 1h — prêt à forger ?"
21h : "130g de protéines aujourd'hui — il te manque 30g 🥩"
22h30 : "Dodo dans 30 min — le muscle se construit pendant le sommeil 💤"
Dimanche soir : Récap de la semaine + preview de la semaine à venir
🎭 ANIMATIONS &amp; MICRO-INTERACTIONS (Spécifications)
Transitions de Page
Entrée : slide from bottom + fade in (0.3s, ease-out)
Sortie : slide to top + fade out (0.2s, ease-in)
Modal : scale from 0.9 + backdrop blur (0.2s, spring)
Feedback Tactile Visuel
Bouton press : scale 0.96 + background lighten 10%
Série validée : check icon draw (SVG stroke animation) + flash blanc 0.1s + haptic vibration
Nouveau PR : chiffre qui pulse (scale 1.2 → 1.0) + glow vert + confettis
Timer fin : shake subtil + glow pulse rouge → vert
Scroll Behaviors
Parallax : images d'exercices scrollent 20% plus lentement que le texte
Snap : calendrier horizontal snap to day, programme snap to week
Pull to refresh : custom animation (barre de métal qui se forge)
📦 STRUCTURE DES DONNÉES
TypeScript
// User Profile
interface User {
  id: string;
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  goal: 'muscle_gain' | 'fat_loss' | 'maintenance';
  level: 'beginner' | 'intermediate' | 'advanced';
  equipment: ('gym' | 'dumbbells' | 'bands' | 'bodyweight')[];
  createdAt: Date;
}

// Program (généré à partir du template)
interface Program {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  weeks: Week[];
  phase: 'adaptation' | 'volume' | 'definition';
}

interface Week {
  number: number;
  phase: string;
  days: Day[];
}

interface Day {
  date: Date;
  name: string; // ex: "Haut du Corps — Carrure"
  focus: string;
  exercises: Exercise[];
  status: 'pending' | 'completed' | 'missed';
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  repsTarget: string; // "8-10"
  restSeconds: number;
  videoUrl?: string;
  alternatives: string[];
  logs: SetLog[];
}

interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rir: number; // 0-4
  completed: boolean;
  timestamp: Date;
}

// Session (instance d'entraînement)
interface WorkoutSession {
  id: string;
  programId: string;
  dayId: string;
  startTime: Date;
  endTime?: Date;
  totalVolume: number;
  prs: PR[];
  notes: string;
}

interface PR {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume';
  previousBest: number;
  newBest: number;
}

// Body Tracking
interface BodyMeasurement {
  date: Date;
  weight: number;
  arms: number;
  chest: number;
  waist: number;
  hips: number;
  thighs: number;
  calves: number;
}

interface ProgressPhoto {
  id: string;
  date: Date;
  angle: 'front' | 'left' | 'right' | 'back';
  url: string;
}

// Nutrition
interface NutritionDay {
  date: Date;
  proteinGoal: number;
  proteinConsumed: number;
  meals: Meal[];
}

interface Meal {
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}
🔧 FONCTIONNALITÉS TECHNIQUES
Offline First
Toutes les données en IndexedDB (Dexie.js)
Service worker qui cache les assets et les images d'exercices
Sync en arrière-plan quand la connexion revient
Mode "Avion" : tout fonctionne sauf le partage social
PWA
Manifest avec icônes adaptatives (Android) + maskable (iOS)
Splash screen avec logo animé
Installation prompt custom (pas le browser default)
Shortcuts : "Démarrer séance du jour", "Voir progression"
Performance
Lazy loading des images d'exercices (Intersection Observer)
Virtual scroll pour les listes longues (journal)
Code splitting par route
Target : &lt; 2s First Contentful Paint sur 4G
Accessibilité
Contraste WCAG AAA (obligatoire sur fond noir)
Navigation clavier complète (Tab, Enter, Escape)
Screen reader labels sur tous les éléments interactifs
Reduced motion respecté (prefers-reduced-motion)
🚀 LIVRABLES ATTENDUS
Code source complet : React + TypeScript + Tailwind + Vite
Design tokens : fichier theme.ts avec toutes les couleurs, spacing, typography
Composants réutilisables : Button, Input, Card, Timer, ProgressRing, Heatmap, Sparkline
Stores Zustand : authStore, workoutStore, progressStore, settingsStore
Hooks personnalisés : useWorkout, useTimer, useOffline, useHaptic
Mock data : programme 12 semaines basé sur le template fourni
README : installation, structure, conventions
📝 NOTES FINALES
Ce qui fait la différence entre une bonne app et une grande app :
Le timer de repos doit être une expérience à lui seul, pas un compteur banal
La validation de série doit donner une satisfaction immédiate (comme cocher une case, mais en mieux)
Le dashboard doit raconter une histoire : "Tu progresses, voici la preuve"
Les micro-interactions doivent être partout — chaque tap doit avoir un feedback
Le dark mode n'est pas un option, c'est l'identité. L'app doit être magnifique dans le noir
Ce qu'il ne faut PAS faire :
Pas de formulaires longs et moches
Pas de calendriers natifs du navigateur
Pas de notifications push agressives
Pas de publicités ou upsells intrusifs
Pas de design "Material Design" ou "iOS native" — FitForge a sa propre identité
Génère le code complet de l'application, en commençant par la structure de dossiers, le design system, puis les composants page par page. Priorise le Dashboard et le Workout Player (cœur de l'expérience).
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design.

Follow this general design process (use the todo list to remember):
(1) ask questions, (2) find existing UI kits and collect design context — copy ALL relevant components and read ALL relevant examples; ask the user if you can't find them, (3) start your file with assumptions + context + design reasoning (as if you are a junior designer and the user is your manager), with placeholders for the designs, and show it to the user early, (4) build out the designs and show the user again ASAP; append some next steps, (5) use your tools to check, verify and iterate on the design.

Good hi-fi designs do not start from scratch — they are rooted in existing design context. Ask the user to Import their codebase, or find a suitable UI kit / design resources, or ask for screenshots of existing UI. You MUST spend time trying to acquire design context, including components. If you cannot find them, ask the user for them. In the Import menu, they can link a local codebase, provide screenshots or Figma links; they can also link another project. Mocking a full product from scratch is a LAST RESORT and will lead to poor design. If stuck, try listing design assets and ls'ing design system files — be proactive! Some designs may need multiple design systems — get them all. Use the starter components (device frames and the like) to get high-quality scaffolding for free.

When presenting several options or explorations side-by-side, lay them out clearly: give the page a neutral gray background, put each option in its own labeled frame (a small heading + a white rounded card sized to its content), and group related options into sections.

When designing, asking many good questions is ESSENTIAL.

Give options: try to give 3+ variations across several dimensions. Mix by-the-book designs that match existing patterns with new and novel interactions, including interesting layouts, metaphors, and visual styles. Have some options that use color or advanced CSS; some with iconography and some without. Start your variations basic and get more advanced and creative as you go! Try remixing the brand assets and visual DNA in interesting ways — play with scale, fills, texture, visual rhythm, layering, novel layouts, type treatments. The goal is not the perfect option; it's exploring atomic variations the user can mix and match.

CSS, HTML, JS and SVG are amazing. Users often don't know what they can do. Surprise the user.

If you do not have an icon, asset or component, draw a placeholder: in hi-fi design, a placeholder is better than a bad attempt at the real thing.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: list_files]_

_[tool: read_skill_prompt]_

_[tool: run_script]_

_[tool: questions_v2]_

## User

Questions answered:
- deliverable: Interactive prototype (feels like the real app)
- scope: Dashboard, Onboarding + Splash, Programme (12 semaines), Everything, Profil & Corps, Journal / Analytics, Récap post-séance, Workout Player (séance en cours)
- language: Français
- frame: Full viewport responsive
- display_font: Space Grotesk (géométrique, moderne)
- demo_state: Simulate week ~4 (history, streaks, PRs populated)
- variations: Rest timer design (the 'experience in itself'), Dashboard hero layout, Set validation gesture (swipe vs button)
- tweaks: Animation speed, Glow intensity
- exercise_imagery: Decide for me

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

Parfait — full scope, week-4 demo state, variations exposed as Tweaks. Building now.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Onboarding renders well. Now let me verify the main app (dashboard) by simulating a completed profile:

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: multi_screenshot]_

Dashboard looks sharp. Quick check of the other tabs and the workout player:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

All screens work. Two fixes needed: a timezone bug in date keys (the missed day lands on the wrong date), and the reps stepper overflows on narrow screens.

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**FitForge est en ligne** — prototype interactif complet du système « Obsidian Forge », alimenté par ton vrai PDF (12 semaines, 4 séances/sem, 3 phases), simulé en semaine 4 (vendredi 10 juillet).

**Le flow :** Splash (logo qui se dessine) → Onboarding 3 étapes → Dashboard. La séance du jour (« Dos épais + Jambes ») se lance avec DÉMARRER → Workout Player immersif (steppers poids/reps intelligents, RIR, timer de repos automatique) → Récap avec volume animé, graphique d'intensité et carte de partage 9:16. Plus Programme (timeline 12 semaines dépliable), Journal (volume hebdo, lifts clés, heatmap) et Profil (mensurations, photos, réglages).

**Tweaks (toolbar) :** timer de repos *Ring / Liquide / Minimal*, hero dashboard *Immersif / Compact / Split*, validation *Swipe / Bouton*, intensité du glow et vitesse des animations.

Caveats & suites possibles :
- Imagerie d'exercices = placeholders striés — envoie tes photos/GIFs et je les intègre
- L'onboarding ne s'affiche qu'au premier lancement (relançable depuis Profil → « Revoir le splash »)
- Si tu veux : mode Superset, notifications intelligentes (« Prêt pour +2,5 kg ? »), ou comparaison photo avant/après

