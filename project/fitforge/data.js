/* ============================================================
   FitForge — données du programme
   Source : « Programme Révisé 3 Mois — Carrure + Définition »
   15 juin → 14 septembre 2026 · 12 semaines · 4 séances/sem
   État simulé : Vendredi 10 juillet 2026 (semaine 4)
   ============================================================ */
(function () {
  'use strict';

  // ---------- simulated "today" : vendredi 10 juillet 2026 ----------
  const TODAY = new Date(2026, 6, 10); // month 0-indexed
  const PROGRAM_START = new Date(2026, 5, 15); // lundi 15 juin 2026

  const DAY_MS = 86400000;
  const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);

  const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const DAYS_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const DAYS_FR_SHORT = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const DAYS_FR_MIN = ['D','L','M','M','J','V','S'];

  function fmtLong(d) {
    return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
  }
  function fmtShort(d) {
    return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}.`;
  }

  // ---------- phases ----------
  const PHASES = [
    { id: 'adaptation', name: 'Adaptation & Technique', weeks: [1, 4], rir: 'RIR 2-3',
      principle: 'Apprendre les mouvements, créer l’habitude, éviter les blessures.',
      cardio: '15 min léger, focus respiration',
      progression: 'Ne change pas les charges, concentre-toi sur la forme.' },
    { id: 'volume', name: 'Prise de Volume', weeks: [5, 8], rir: 'RIR 1-2',
      principle: 'Ajouter du poids ou des reps progressivement.',
      cardio: '18-20 min, inclinaison 5-6%',
      progression: 'En haut de la fourchette de reps → augmente légèrement la charge.' },
    { id: 'definition', name: 'Carrure + Définition', weeks: [9, 12], rir: 'RIR 1',
      principle: 'Garder les charges lourdes, affiner l’alimentation.',
      cardio: '20 min inclinaison 6%, ou HIIT 15 min optionnel',
      progression: 'Maintien des charges, focus sur la contraction musculaire.' },
  ];
  const phaseOfWeek = (w) => PHASES.find((p) => w >= p.weeks[0] && w <= p.weeks[1]);

  // ---------- templates de jours (issus du PDF) ----------
  // base = charge de départ (kg) · inc = incrément de progression · rest = repos (s)
  const DAY_TEMPLATES = {
    1: { // Lundi — salle
      name: 'Dos + Épaules + Pecs', short: 'Carrure', location: 'Salle',
      exercises: [
        { id: 'dev-incline', name: 'Développé incliné', muscle: 'Pectoraux', sets: 4, reps: '8-10', rest: 120, base: 40, inc: 2.5, note: 'Poitrine haute, contrôle la descente' },
        { id: 'tirage-large', name: 'Tirage vertical prise large', muscle: 'Dos', sets: 4, reps: '8-12', rest: 90, base: 50, inc: 2.5, note: 'Coudes vers le bas, squeeze en haut' },
        { id: 'rowing-tbar', name: 'Rowing assis / T-Bar', muscle: 'Dos', sets: 4, reps: '10', rest: 90, base: 45, inc: 2.5, note: 'Dos droit, tire vers le nombril' },
        { id: 'dev-epaules', name: 'Développé épaules', muscle: 'Épaules', sets: 3, reps: '8-10', rest: 90, base: 26, inc: 2.5, note: 'Pleine amplitude, pas de triche' },
        { id: 'elev-lat', name: 'Élévations latérales', muscle: 'Épaules', sets: 3, reps: '18-20', rest: 60, base: 8, inc: 1, note: 'Coudes légèrement fléchis, monte à 90°' },
        { id: 'face-pull', name: 'Face pull', muscle: 'Épaules post.', sets: 3, reps: '18-20', rest: 60, base: 25, inc: 1, note: 'Postérieur épaules + posture' },
        { id: 'curl-ez', name: 'Curl biceps barre EZ', muscle: 'Biceps', sets: 3, reps: '10-12', rest: 60, base: 25, inc: 1, note: 'Pas de balancement' },
        { id: 'triceps-poulie', name: 'Triceps poulie haute', muscle: 'Triceps', sets: 3, reps: '10-12', rest: 60, base: 30, inc: 1, note: 'Coudes fixes le long du corps' },
      ],
      cardio: 'Tapis 20 min · 5,5-6,5 km/h · inclinaison 4-6%' },
    3: { // Mercredi — maison
      name: 'Jambes + Haut du corps + Core', short: 'Full body maison', location: 'Maison',
      exercises: [
        { id: 'pompes', name: 'Pompes', muscle: 'Pectoraux', sets: 4, reps: 'Max -2', rest: 90, base: null, inc: 0, note: 'Normales ou archer · garde 2 reps en réserve' },
        { id: 'pike-pushup', name: 'Pike push-up', muscle: 'Épaules', sets: 3, reps: '8-12', rest: 90, base: null, inc: 0, note: 'Fesses en l’air, descente contrôlée' },
        { id: 'superman-row', name: 'Superman / Row sac à dos', muscle: 'Dos', sets: 3, reps: '12-15', rest: 60, base: null, inc: 0, note: 'Travail du dos sans matériel' },
        { id: 'squats', name: 'Squats', muscle: 'Quadriceps', sets: 4, reps: '15-20', rest: 90, base: null, inc: 0, note: 'Profonds, genoux alignés orteils' },
        { id: 'fentes', name: 'Fentes avant', muscle: 'Jambes', sets: 3, reps: '12/jambe', rest: 60, base: null, inc: 0, note: 'Torse droit, pas de balancement' },
        { id: 'planche', name: 'Gainage planche', muscle: 'Core', sets: 3, reps: '40-60 s', rest: 60, base: null, inc: 0, note: 'Corps droit comme une planche' },
        { id: 'releves-jambes', name: 'Relevés de jambes', muscle: 'Core', sets: 3, reps: '15', rest: 60, base: null, inc: 0, note: 'Bas du ventre, pas d’élan' },
      ],
      cardio: 'Marche rapide 30 min · allure soutenue' },
    5: { // Vendredi — salle
      name: 'Dos épais + Jambes', short: 'Postérieur épaules', location: 'Salle',
      exercises: [
        { id: 'squat-guide', name: 'Squat guidé / Goblet', muscle: 'Quadriceps', sets: 4, reps: '10', rest: 120, base: 50, inc: 5, note: 'Phase 1 : technique → phase 2-3 : charge' },
        { id: 'presse', name: 'Presse à jambes', muscle: 'Jambes', sets: 3, reps: '12', rest: 90, base: 100, inc: 5, note: 'Pieds hauts pour les fessiers' },
        { id: 'leg-curl', name: 'Leg curl allongé', muscle: 'Ischios', sets: 3, reps: '10-12', rest: 60, base: 35, inc: 2.5, note: 'Contraction ischios en haut' },
        { id: 'leg-ext', name: 'Extensions de jambes', muscle: 'Quadriceps', sets: 3, reps: '12-15', rest: 60, base: 40, inc: 2.5, note: 'Quadris en isolation' },
        { id: 'tirage-neutre', name: 'Tirage vertical prise neutre', muscle: 'Dos', sets: 4, reps: '8-12', rest: 90, base: 50, inc: 2.5, note: 'Variante pour varier l’angle' },
        { id: 'rowing-machine', name: 'Rowing chest-supported', muscle: 'Dos', sets: 4, reps: '10', rest: 90, base: 45, inc: 2.5, note: 'Squeeze 1 sec en haut' },
        { id: 'elev-lat-2', name: 'Élévations latérales', muscle: 'Épaules', sets: 4, reps: '12-20', rest: 60, base: 8, inc: 1, note: 'Volume épaules, strict' },
        { id: 'face-pull-er', name: 'Face pull + rotation ext.', muscle: 'Épaules post.', sets: 3, reps: '15', rest: 60, base: 25, inc: 1, note: 'Épaules saines + carrure arrière' },
      ],
      cardio: 'Cardio léger 20 min · inclinaison modérée' },
    0: { // Dimanche — maison
      name: 'Récupération active + Mobilité', short: 'Mobilité', location: 'Maison',
      exercises: [
        { id: 'pompes-diamant', name: 'Pompes diamant / larges', muscle: 'Pectoraux', sets: 4, reps: 'Max -2', rest: 90, base: null, inc: 0, note: 'Variante pour cibler différemment' },
        { id: 'pike-pushup-2', name: 'Pike push-up', muscle: 'Épaules', sets: 3, reps: '8-12', rest: 90, base: null, inc: 0, note: 'Développé épaules au poids du corps' },
        { id: 'superman-3d', name: 'Superman 3D', muscle: 'Dos', sets: 3, reps: '12', rest: 60, base: null, inc: 0, note: 'Bras en Y, T, W pour tout le dos' },
        { id: 'squats-lents', name: 'Squats lents', muscle: 'Quadriceps', sets: 3, reps: '20', rest: 60, base: null, inc: 0, note: '3 s descente, 1 s pause en bas' },
        { id: 'fentes-statiques', name: 'Fentes statiques', muscle: 'Jambes', sets: 2, reps: '30 s/jambe', rest: 45, base: null, inc: 0, note: 'Tenue isométrique' },
        { id: 'gainage-lateral', name: 'Gainage latéral', muscle: 'Core', sets: 3, reps: '30-45 s', rest: 45, base: null, inc: 0, note: 'Hanche haute, pas de relâchement' },
        { id: 'dead-bug', name: 'Dead bug', muscle: 'Core', sets: 3, reps: '10/côté', rest: 45, base: null, inc: 0, note: 'Lombaires plaquées au sol' },
      ],
      cardio: 'Étirements 10-12 min + marche lente 30 min' },
  };
  const TRAINING_WEEKDAYS = [1, 3, 5, 0]; // lun, mer, ven, dim

  // ---------- pseudo-random déterministe ----------
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  }
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h) || 1;
  }

  // charge cible pour une semaine donnée (progression toutes les 2 semaines)
  function targetWeight(ex, week) {
    if (ex.base == null) return null;
    return ex.base + Math.floor((week - 1) / 2) * ex.inc;
  }
  function repsRange(reps) {
    const m = String(reps).match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) return [+m[1], +m[2]];
    const n = String(reps).match(/^(\d+)$/);
    if (n) return [+n[1], +n[1]];
    return null; // temps, max, etc.
  }

  // ---------- génération du programme 12 semaines ----------
  const weeks = [];
  for (let w = 1; w <= 12; w++) {
    const monday = addDays(PROGRAM_START, (w - 1) * 7);
    const days = TRAINING_WEEKDAYS.map((wd) => {
      const offset = wd === 0 ? 6 : wd - 1;
      const date = addDays(monday, offset);
      const tpl = DAY_TEMPLATES[wd];
      return {
        id: `w${w}-d${wd}`, week: w, weekday: wd, date, iso: fmtISO(date),
        name: tpl.name, short: tpl.short, location: tpl.location, cardio: tpl.cardio,
        exercises: tpl.exercises.map((ex) => ({ ...ex, target: targetWeight(ex, w) })),
      };
    });
    weeks.push({ number: w, monday, phase: phaseOfWeek(w), days });
  }

  // ---------- historique simulé ----------
  // Complétées : S1-S3 entières (sauf dim 28/06 manqué), S4 : lun 06/07 + mer 08/07.
  const MISSED = new Set(['2026-06-28']);
  const history = {}; // iso -> session record

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      if (day.date >= TODAY) return;
      if (MISSED.has(day.iso)) { history[day.iso] = { status: 'missed' }; return; }
      const rand = rng(hash(day.iso));
      let volume = 0;
      const prs = [];
      const exercises = day.exercises.map((ex) => {
        const range = repsRange(ex.reps);
        const sets = [];
        for (let s = 1; s <= ex.sets; s++) {
          let reps;
          if (range) reps = Math.max(range[0], range[1] - Math.floor(rand() * 3) - (s > 2 ? 1 : 0));
          else reps = 14 - s - Math.floor(rand() * 2); // "Max -2" etc.
          const rir = week.number <= 4 ? 2 + Math.round(rand()) : 1 + Math.round(rand());
          const weight = ex.target;
          if (weight) volume += weight * reps;
          sets.push({ set: s, weight, reps, rir });
        }
        // PR si la charge vient d'augmenter cette semaine
        if (ex.target && week.number > 1 && targetWeight(ex, week.number - 1) < ex.target) {
          prs.push({ exercise: ex.name, type: 'Charge', prev: targetWeight(ex, week.number - 1), next: ex.target });
        }
        return { id: ex.id, name: ex.name, sets };
      });
      const duration = 48 + Math.floor(rand() * 18); // minutes
      history[day.iso] = { status: 'completed', volume: Math.round(volume), duration, exercises, prs, avgRir: week.number <= 4 ? 2.4 : 1.5 };
    });
  });

  // ---------- agrégats ----------
  const completedSessions = Object.entries(history).filter(([, s]) => s.status === 'completed');

  // streak = séances consécutives complétées (en remontant depuis aujourd'hui)
  let streak = 0;
  {
    const all = [];
    weeks.forEach((w) => w.days.forEach((d) => { if (d.date < TODAY) all.push(d); }));
    all.sort((a, b) => b.date - a.date);
    for (const d of all) {
      if (history[d.iso] && history[d.iso].status === 'completed') streak++;
      else break;
    }
  }

  // volume hebdo (pour le journal)
  const weeklyVolume = weeks.map((w) => {
    let v = 0, done = 0, total = 0;
    w.days.forEach((d) => {
      if (d.date < TODAY) {
        total++;
        const s = history[d.iso];
        if (s && s.status === 'completed') { v += s.volume || 0; done++; }
      } else if (d.date >= TODAY) total++;
    });
    return { week: w.number, volume: v, done, planned: w.days.length };
  });

  // progression des lifts clés (charge cible loggée par semaine)
  const KEY_LIFTS = [
    { id: 'dev-incline', name: 'Développé incliné', color: '#00F0FF' },
    { id: 'squat-guide', name: 'Squat guidé', color: '#FF3D71' },
    { id: 'rowing-tbar', name: 'Rowing T-Bar', color: '#39FF14' },
    { id: 'dev-epaules', name: 'Développé épaules', color: '#8A8A8A' },
  ];
  const liftSeries = KEY_LIFTS.map((lift) => {
    const pts = [];
    weeks.forEach((w) => {
      w.days.forEach((d) => {
        const s = history[d.iso];
        if (s && s.status === 'completed') {
          const ex = s.exercises.find((e) => e.id === lift.id);
          if (ex) {
            const top = Math.max(...ex.sets.map((st) => st.weight || 0));
            if (top) pts.push({ week: w.number, value: top });
          }
        }
      });
    });
    return { ...lift, points: pts };
  });

  // poids corporel (relevé hebdo)
  const bodyWeight = [70.0, 70.2, 70.6, 70.9, 71.2].map((v, i) => ({
    date: addDays(PROGRAM_START, i * 7), value: v,
  }));

  // dernier PR
  const lastPR = { exercise: 'Développé incliné', prev: 40, next: 42.5, date: new Date(2026, 6, 6), unit: 'kg' };

  // ---------- séance du jour ----------
  const todayDay = weeks.flatMap((w) => w.days).find((d) => d.iso === fmtISO(TODAY)) || null;

  // ---------- mensurations ----------
  const measurements = [
    { zone: 'Épaules', key: 'shoulders', values: [112, 113, 114.5], goal: 118 },
    { zone: 'Poitrine', key: 'chest', values: [96, 96.5, 97.5], goal: 100 },
    { zone: 'Bras', key: 'arms', values: [33, 33.4, 34], goal: 36 },
    { zone: 'Taille', key: 'waist', values: [82, 81.5, 80.8], goal: 78 },
    { zone: 'Cuisses', key: 'thighs', values: [55, 55.5, 56], goal: 58 },
    { zone: 'Mollets', key: 'calves', values: [36, 36, 36.2], goal: 37 },
  ];

  const user = {
    name: 'Alex', initials: 'AX', weight: 71.2, height: 178,
    goal: 'Prise de muscle', proteinGoal: 140,
  };

  window.FF = {
    TODAY, PROGRAM_START, PHASES, weeks, history, todayDay, user,
    streak, weeklyVolume, liftSeries, KEY_LIFTS, bodyWeight, lastPR, measurements,
    completedCount: completedSessions.length,
    totalVolume: completedSessions.reduce((a, [, s]) => a + (s.volume || 0), 0),
    fmtISO, fmtLong, fmtShort, addDays,
    DAYS_FR, DAYS_FR_SHORT, DAYS_FR_MIN, MONTHS_FR,
    repsRange, currentWeek: 4,
  };
})();
