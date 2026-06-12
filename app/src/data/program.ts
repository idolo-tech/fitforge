/* ============================================================
   FitForge — DÉFINITION DU PROGRAMME (pure, sans données simulées)
   Source : « Programme Révisé 3 Mois — Carrure + Définition »
   Démarrage : lundi 15 juin 2026 · 12 semaines · 4 séances/sem
   Les charges ne sont PAS prescrites par le PDF : l'utilisateur
   les saisit pendant la séance (le store retient la dernière).
   ============================================================ */
import type { Phase, Exercise, Day, Week, Measurement, User } from './types';

const DAY_MS = 86400000;
const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// ---------- dates réelles ----------
export const PROGRAM_START = new Date(2026, 5, 15); // lundi 15 juin 2026
export const TODAY = startOfDay(new Date());        // aujourd'hui (date réelle)

export const fmtISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * DAY_MS);
export const daysBetween = (a: Date, b: Date): number => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

export const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const DAYS_FR_MIN = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function fmtLong(d: Date): string {
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}
export function fmtShort(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}.`;
}

// ---------- phases (avec consigne nutrition propre à la phase) ----------
export const PHASES: Phase[] = [
  { id: 'adaptation', name: 'Adaptation & Technique', weeks: [1, 4], rir: 'RIR 2-3',
    principle: 'Apprendre les mouvements, créer l’habitude, éviter les blessures.',
    cardio: '15 min léger, focus sur la respiration',
    progression: 'Ne change pas les charges, concentre-toi sur la forme.',
    nutrition: 'Établir les bases : protéines à chaque repas, hydratation, sommeil 7-8 h.' },
  { id: 'volume', name: 'Prise de Volume', weeks: [5, 8], rir: 'RIR 1-2',
    principle: 'Ajouter du poids ou des reps progressivement.',
    cardio: '18-20 min, inclinaison 5-6%',
    progression: 'En haut de la fourchette de reps sur 2 séances → augmente légèrement la charge.',
    nutrition: '+200-300 kcal par rapport à ta maintenance, 1,8-2 g de protéines/kg.' },
  { id: 'definition', name: 'Carrure + Définition', weeks: [9, 12], rir: 'RIR 1',
    principle: 'Garder les charges lourdes, affiner l’alimentation.',
    cardio: '20 min inclinaison 6%, ou 1 séance HIIT 15 min optionnelle',
    progression: 'Maintien des charges, focus sur la contraction musculaire.',
    nutrition: 'Légèrement sous maintenance (-100 à -200 kcal), protéines 2-2,2 g/kg, moins de sel le soir.' },
];
const phaseOfWeek = (w: number): Phase => PHASES.find((p) => w >= p.weeks[0] && w <= p.weeks[1])!;

// ---------- templates de jours (issus du PDF, sans charges) ----------
// weighted: true = charge externe (salle) · false = poids du corps / temps
interface DayTemplate {
  name: string;
  short: string;
  location: string;
  exercises: Exercise[];
  cardio: string;
}

const DAY_TEMPLATES: Record<number, DayTemplate> = {
  1: { // Lundi — salle
    name: 'Dos + Épaules + Pecs', short: 'Carrure', location: 'Salle',
    exercises: [
      { id: 'dev-incline', name: 'Développé incliné', muscle: 'Pectoraux', sets: 4, reps: '8-10', rest: 120, weighted: true, note: 'Poitrine haute, contrôle la descente' },
      { id: 'tirage-large', name: 'Tirage vertical prise large', muscle: 'Dos', sets: 4, reps: '8-12', rest: 90, weighted: true, note: 'Coudes vers le bas, squeeze en haut' },
      { id: 'rowing-tbar', name: 'Rowing assis / T-Bar', muscle: 'Dos', sets: 4, reps: '10', rest: 90, weighted: true, note: 'Dos droit, tire vers le nombril' },
      { id: 'dev-epaules', name: 'Développé épaules (haltères ou barre)', muscle: 'Épaules', sets: 3, reps: '8-10', rest: 90, weighted: true, note: 'Pleine amplitude, pas de triche' },
      { id: 'elev-lat', name: 'Élévations latérales', muscle: 'Épaules', sets: 3, reps: '18-20', rest: 60, weighted: true, note: 'Coudes légèrement fléchis, monte à 90°' },
      { id: 'face-pull', name: 'Face pull', muscle: 'Épaules post.', sets: 3, reps: '18-20', rest: 60, weighted: true, note: 'Postérieur épaules + posture' },
      { id: 'curl-ez', name: 'Curl biceps barre EZ', muscle: 'Biceps', sets: 3, reps: '10-12', rest: 60, weighted: true, note: 'Pas de balancement' },
      { id: 'triceps-poulie', name: 'Triceps poulie haute / barre EZ', muscle: 'Triceps', sets: 3, reps: '10-12', rest: 60, weighted: true, note: 'Coudes fixes le long du corps' },
    ],
    cardio: 'Cardio léger 20 min · tapis 5,5-6,5 km/h · inclinaison 4-6%' },
  3: { // Mercredi — maison
    name: 'Jambes + Haut du corps + Core', short: 'Full body maison', location: 'Maison',
    exercises: [
      { id: 'pompes', name: 'Pompes (normales ou archer)', muscle: 'Pectoraux', sets: 4, reps: 'Max -2', rest: 90, weighted: false, note: 'RIR 3 — garde 2 reps en réserve (phase 1)' },
      { id: 'pike-pushup', name: 'Pike push-up', muscle: 'Épaules', sets: 3, reps: '8-12', rest: 90, weighted: false, note: 'Fesses en l’air, descente contrôlée' },
      { id: 'superman-row', name: 'Superman / Row sac à dos', muscle: 'Dos', sets: 3, reps: '12-15', rest: 60, weighted: false, note: 'Travail du dos sans matériel' },
      { id: 'squats', name: 'Squats', muscle: 'Quadriceps', sets: 4, reps: '15-20', rest: 90, weighted: false, note: 'Profonds, genoux alignés orteils' },
      { id: 'fentes', name: 'Fentes avant ou alternées', muscle: 'Jambes', sets: 3, reps: '12/jambe', rest: 60, weighted: false, note: 'Torse droit, pas de balancement' },
      { id: 'planche', name: 'Gainage planche', muscle: 'Core', sets: 3, reps: '40-60 s', rest: 60, weighted: false, note: 'Corps droit comme une planche' },
      { id: 'releves-jambes', name: 'Relevés de jambes suspendus ou au sol', muscle: 'Core', sets: 3, reps: '15', rest: 60, weighted: false, note: 'Bas du ventre, pas d’élan' },
    ],
    cardio: 'Marche rapide 30 min · allure soutenue, pas de course' },
  5: { // Vendredi — salle
    name: 'Dos épais + Jambes', short: 'Postérieur épaules', location: 'Salle',
    exercises: [
      { id: 'squat-guide', name: 'Squat guidé ou Goblet squat', muscle: 'Quadriceps', sets: 4, reps: '10', rest: 120, weighted: true, note: 'Phase 1 : technique → phase 2-3 : charge' },
      { id: 'presse', name: 'Presse à jambes', muscle: 'Jambes', sets: 3, reps: '12', rest: 90, weighted: true, note: 'Pieds hauts pour les fessiers' },
      { id: 'leg-curl', name: 'Leg curl allongé', muscle: 'Ischios', sets: 3, reps: '10-12', rest: 60, weighted: true, note: 'Contraction ischios en haut' },
      { id: 'leg-ext', name: 'Extensions de jambes', muscle: 'Quadriceps', sets: 3, reps: '12-15', rest: 60, weighted: true, note: 'Quadris en isolation' },
      { id: 'tirage-neutre', name: 'Tirage vertical prise neutre', muscle: 'Dos', sets: 4, reps: '8-12', rest: 90, weighted: true, note: 'Variante pour varier l’angle' },
      { id: 'rowing-machine', name: 'Rowing machine / Chest-supported', muscle: 'Dos', sets: 4, reps: '10', rest: 90, weighted: true, note: 'Squeeze 1 sec en haut' },
      { id: 'elev-lat-2', name: 'Élévations latérales', muscle: 'Épaules', sets: 4, reps: '12-20', rest: 60, weighted: true, note: 'Volume épaules, strict' },
      { id: 'face-pull-er', name: 'Face pull + external rotation', muscle: 'Épaules post.', sets: 3, reps: '15', rest: 60, weighted: true, note: 'Épaules saines + carrure arrière' },
    ],
    cardio: 'Cardio léger 20 min · inclinaison modérée, conversation possible' },
  0: { // Dimanche — maison
    name: 'Récupération active + Mobilité', short: 'Mobilité', location: 'Maison',
    exercises: [
      { id: 'pompes-diamant', name: 'Pompes diamant ou larges', muscle: 'Pectoraux', sets: 4, reps: 'Max -2', rest: 90, weighted: false, note: 'Variante pour cibler différemment' },
      { id: 'pike-pushup-2', name: 'Pike push-up', muscle: 'Épaules', sets: 3, reps: '8-12', rest: 90, weighted: false, note: 'Développé épaules au poids du corps' },
      { id: 'superman-3d', name: 'Superman 3D', muscle: 'Dos', sets: 3, reps: '12', rest: 60, weighted: false, note: 'Bras en Y, T, W pour tout le dos' },
      { id: 'squats-lents', name: 'Squats lents', muscle: 'Quadriceps', sets: 3, reps: '20', rest: 60, weighted: false, note: '3 s descente, 1 s pause en bas' },
      { id: 'fentes-statiques', name: 'Fentes statiques', muscle: 'Jambes', sets: 2, reps: '30 s/jambe', rest: 45, weighted: false, note: 'Tenue isométrique' },
      { id: 'gainage-lateral', name: 'Gainage latéral', muscle: 'Core', sets: 3, reps: '30-45 s/côté', rest: 45, weighted: false, note: 'Hanche haute, pas de relâchement' },
      { id: 'dead-bug', name: 'Dead bug', muscle: 'Core', sets: 3, reps: '10/côté', rest: 45, weighted: false, note: 'Lombaires plaquées au sol' },
      { id: 'etirements', name: 'Étirements dynamiques + statiques', muscle: 'Mobilité', sets: 1, reps: '10-12 min', rest: 0, weighted: false, note: 'Épaules, hanches, dos, ischios' },
    ],
    cardio: 'Marche lente 30 min · récupération active, pas de pression' },
};
const TRAINING_WEEKDAYS = [1, 3, 5, 0]; // lun, mer, ven, dim

// ---------- démos d'exercices : free-exercise-db (domaine public, CDN jsDelivr) ----------
// Chaque exo du programme → identifiant du dataset. 2 images (début / fin du mouvement)
// que l'UI fait alterner pour une démo animée. Absent ici → placeholder vivant en secours.
const MEDIA_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';
const EX_DB_ID: Record<string, string> = {
  'dev-incline': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'tirage-large': 'Wide-Grip_Lat_Pulldown',
  'rowing-tbar': 'Lying_T-Bar_Row',
  'dev-epaules': 'Dumbbell_Shoulder_Press',
  'elev-lat': 'Side_Lateral_Raise',
  'face-pull': 'Face_Pull',
  'curl-ez': 'EZ-Bar_Curl',
  'triceps-poulie': 'Triceps_Pushdown_-_Rope_Attachment',
  'pompes': 'Pushups',
  'superman-row': 'Superman',
  'squats': 'Bodyweight_Squat',
  'fentes': 'Bodyweight_Walking_Lunge',
  'planche': 'Plank',
  'releves-jambes': 'Hanging_Leg_Raise',
  'squat-guide': 'Goblet_Squat',
  'presse': 'Leg_Press',
  'leg-curl': 'Lying_Leg_Curls',
  'leg-ext': 'Leg_Extensions',
  'tirage-neutre': 'Close-Grip_Front_Lat_Pulldown',
  'rowing-machine': 'Leverage_High_Row',
  'elev-lat-2': 'Side_Lateral_Raise',
  'face-pull-er': 'Face_Pull',
  'pompes-diamant': 'Push-Ups_-_Close_Triceps_Position',
  'superman-3d': 'Superman',
  'squats-lents': 'Bodyweight_Squat',
  'fentes-statiques': 'Bodyweight_Walking_Lunge',
  'gainage-lateral': 'Side_Bridge',
  'dead-bug': 'Dead_Bug',
  'etirements': 'Quad_Stretch',
};
/** URLs des frames de démo pour un exo du programme (vide si non mappé). */
export function exerciseImages(exId: string): string[] {
  const dbId = EX_DB_ID[exId];
  return dbId ? [`${MEDIA_BASE}/${dbId}/0.jpg`, `${MEDIA_BASE}/${dbId}/1.jpg`] : [];
}

export function repsRange(reps: string | number): [number, number] | null {
  const m = String(reps).match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) return [+m[1], +m[2]];
  const n = String(reps).match(/^(\d+)$/);
  if (n) return [+n[1], +n[1]];
  return null; // temps, max, etc.
}

// ---------- génération du programme 12 semaines ----------
export const weeks: Week[] = [];
for (let w = 1; w <= 12; w++) {
  const monday = addDays(PROGRAM_START, (w - 1) * 7);
  const days: Day[] = TRAINING_WEEKDAYS.map((wd) => {
    const offset = wd === 0 ? 6 : wd - 1;
    const date = addDays(monday, offset);
    const tpl = DAY_TEMPLATES[wd];
    return {
      id: `w${w}-d${wd}`, week: w, weekday: wd, date, iso: fmtISO(date),
      name: tpl.name, short: tpl.short, location: tpl.location, cardio: tpl.cardio,
      exercises: tpl.exercises.map((ex) => ({ ...ex, images: exerciseImages(ex.id) })),
    };
  });
  weeks.push({ number: w, monday, phase: phaseOfWeek(w), days });
}

export const allDays: Day[] = weeks.flatMap((w) => w.days);
export const isoToWeek: Record<string, number> = {};
allDays.forEach((d) => { isoToWeek[d.iso] = d.week; });
export const PROGRAM_END = allDays[allDays.length - 1].date;

/** catalogue des exercices à charge externe, dédupliqués (passé à l'IA) */
export const WEIGHTED_EXERCISES: { exId: string; name: string; muscle: string; reps: string }[] = (() => {
  const seen = new Map<string, { exId: string; name: string; muscle: string; reps: string }>();
  for (const d of allDays) for (const ex of d.exercises) {
    if (ex.weighted && !seen.has(ex.id)) seen.set(ex.id, { exId: ex.id, name: ex.name, muscle: ex.muscle, reps: ex.reps });
  }
  return [...seen.values()];
})();

// ---------- état temporel (réel) ----------
const offset = daysBetween(PROGRAM_START, TODAY);
export const programStarted = offset >= 0;
export const daysUntilStart = Math.max(0, -offset);
export const currentWeek = Math.min(12, Math.max(1, Math.floor(offset / 7) + 1));
/** séance planifiée aujourd'hui (jour d'entraînement), sinon null */
export const todayPlanned: Day | null = allDays.find((d) => d.iso === fmtISO(TODAY)) || null;
/** première séance du programme */
export const firstSession: Day = allDays[0];

// ---------- lifts clés suivis (couleurs) ----------
export const KEY_LIFTS = [
  { id: 'dev-incline', name: 'Développé incliné', color: '#00F0FF' },
  { id: 'squat-guide', name: 'Squat guidé', color: '#FF3D71' },
  { id: 'rowing-tbar', name: 'Rowing T-Bar', color: '#39FF14' },
  { id: 'dev-epaules', name: 'Développé épaules', color: '#8A8A8A' },
];

// ---------- zones de mensuration suivies (valeurs saisies par l'utilisateur) ----------
export const MEASURE_DEFS: Pick<Measurement, 'zone' | 'key'>[] = [
  { zone: 'Épaules', key: 'shoulders' },
  { zone: 'Poitrine', key: 'chest' },
  { zone: 'Bras', key: 'arms' },
  { zone: 'Taille', key: 'waist' },
  { zone: 'Cuisses', key: 'thighs' },
  { zone: 'Mollets', key: 'calves' },
];

// ---------- profil par défaut (écrasé par l'onboarding) ----------
export const user: User = {
  name: 'Athlète', initials: 'AT', weight: 70, height: 178,
  goal: 'Prise de muscle', proteinGoal: 140,
};

// ---------- contenu de référence (issu du PDF) ----------
export const PROGRAM_GOAL: string[] = [
  '+2 à +4 kg de muscle / progression physique',
  'Épaules et dos plus larges, taille plus propre',
  'Visage légèrement plus sec',
];

export const NUTRITION_KEY: { k: string; v: string }[] = [
  { k: 'Protéines', v: '1,8-2,2 g/kg de poids corporel (70 kg → 130-150 g/jour)' },
  { k: 'Glucides', v: 'propres, autour de l’entraînement' },
  { k: 'À éviter', v: 'sucre, soda, fast-food, sel le soir' },
  { k: 'Hydratation', v: '2,5-3 L d’eau / jour' },
  { k: 'Sommeil', v: '7-8 h minimum' },
];

export const PROGRESSION_RULE =
  'Quand tu atteins facilement le haut de la fourchette de reps sur 2 séances consécutives, augmente la charge de 2,5-5 % (ex : 20 kg → 22,5 kg).';

export const TIPS: { title: string; text: string }[] = [
  { title: 'Technique > Ego', text: 'Mieux vaut 8 reps parfaites que 12 reps bancales. La qualité construit le muscle, pas la quantité de poids sur la barre.' },
  { title: 'Le dos = la carrure', text: 'Les épaules larges c’est bien, mais un dos épais et large crée la forme en V. Ne néglige jamais le tirage et le rowing.' },
  { title: 'Consistance > Intensité', text: '4 séances par semaine pendant 3 mois = 48 séances. C’est ça qui fait la différence, pas une séance à 110 %.' },
];

export const FACE_TIPS: string[] = [
  'Moins de sel le soir (arrête à 19 h)',
  'Dormir suffisamment (le manque de sommeil gonfle le visage)',
  'Cardio léger régulier',
  'Hydratation constante',
];

/** Lien démonstration : recherche vidéo ciblée sur le nom de l'exercice. */
export const exerciseDemoUrl = (name: string): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' technique musculation')}`;
