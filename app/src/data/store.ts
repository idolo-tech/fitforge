/* ============================================================
   FitForge — store de données PERSONNEL (persistant, localStorage)
   Toutes les stats partent de zéro et se remplissent au fil de
   tes séances réelles. Aucune donnée simulée.
   ============================================================ */
import { useSyncExternalStore } from 'react';
import {
  TODAY, fmtISO, weeks, allDays, isoToWeek, KEY_LIFTS, MEASURE_DEFS, programStarted, firstSession,
  addDays, daysBetween, currentWeek, nextTrainingDate,
} from './program';
import type { Day } from './types';

const KEY = 'fitforge_data_v1';

export interface LoggedSet { weight: number | null; reps: number; rir: number; }
export interface LoggedExercise { id: string; name: string; sets: LoggedSet[]; }
export interface LoggedSession {
  iso: string;
  dayId: string;
  dayName: string;
  finishedAt: string;     // ISO datetime
  durationSec: number;
  volume: number;
  avgRir: number;
  exercises: LoggedExercise[];
  prs: { exercise: string; prev: number; next: number }[];
}
export interface BodyEntry { date: string; value: number; }
export interface MeasureEntry { date: string; value: number; }

/** prescription du calque pour un exercice (écrite par l'IA) */
export interface Prescription { targetWeight: number; reason?: string; }

export interface StoreData {
  sessions: Record<string, LoggedSession>;   // par date ISO
  bodyWeight: BodyEntry[];
  measurements: Record<string, MeasureEntry[]>;
  lastWeights: Record<string, number>;        // exId -> dernière charge saisie
  notes: Record<string, string>;              // iso -> note de séance
  plan: Record<string, Prescription>;         // exId -> prescription (calque IA)
}

const EMPTY: StoreData = { sessions: {}, bodyWeight: [], measurements: {}, lastWeights: {}, notes: {}, plan: {} };

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return EMPTY;
}

let data: StoreData = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function useStore(): StoreData {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => data,
  );
}
export const getData = (): StoreData => data;

// ---------- pont Convex (optionnel) ----------
// Le store reste synchrone (localStorage = cache instantané + offline).
// Quand Convex est branché, les mutations écrivent aussi dans le cloud, et
// les données du cloud sont fusionnées dans le store (le cloud gagne en cas
// de conflit). Aucun composant ni sélecteur ne change.
export interface CloudBackend {
  saveSession: (s: LoggedSession) => Promise<unknown>;
  addBodyWeight: (date: string, value: number) => Promise<unknown>;
  addMeasurement: (key: string, date: string, value: number) => Promise<unknown>;
  setNote: (iso: string, text: string) => Promise<unknown>;
}
let backend: CloudBackend | null = null;
export function setCloudBackend(b: CloudBackend | null): void { backend = b; }

/** Vide le cache local (à la déconnexion) pour qu'un autre compte reparte du cloud. */
export function resetLocalStore(): void {
  data = EMPTY;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

type Dated = { date: string; value: number };
function mergeDated<T extends Dated>(local: T[], cloud: T[]): T[] {
  const byDate = new Map<string, T>();
  for (const e of local) byDate.set(e.date, e);
  for (const e of cloud) byDate.set(e.date, e); // le cloud gagne
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Fusionne un instantané du cloud dans le store local (cloud prioritaire). */
export function hydrateFromCloud(cloud: StoreData): void {
  const measureKeys = new Set([...Object.keys(data.measurements), ...Object.keys(cloud.measurements)]);
  const measurements: Record<string, MeasureEntry[]> = {};
  for (const k of measureKeys) measurements[k] = mergeDated(data.measurements[k] || [], cloud.measurements[k] || []);

  const merged: StoreData = {
    sessions: { ...data.sessions, ...cloud.sessions },
    bodyWeight: mergeDated(data.bodyWeight, cloud.bodyWeight),
    measurements,
    lastWeights: { ...data.lastWeights, ...cloud.lastWeights },
    notes: { ...data.notes, ...cloud.notes },
    plan: { ...data.plan, ...cloud.plan },
  };
  if (JSON.stringify(merged) === JSON.stringify(data)) return; // pas de notification inutile
  data = merged;
  persist();
}

// ---------- mutations ----------
export function saveSession(s: LoggedSession): void {
  const lastWeights = { ...data.lastWeights };
  s.exercises.forEach((e) => e.sets.forEach((st) => { if (st.weight != null) lastWeights[e.id] = st.weight; }));
  data = { ...data, sessions: { ...data.sessions, [s.iso]: s }, lastWeights };
  persist();
  backend?.saveSession(s).catch(() => { /* offline : resync au prochain chargement */ });
}

export function addBodyWeight(value: number): void {
  const iso = fmtISO(TODAY);
  const bodyWeight = data.bodyWeight.filter((b) => b.date !== iso).concat({ date: iso, value });
  bodyWeight.sort((a, b) => a.date.localeCompare(b.date));
  data = { ...data, bodyWeight };
  persist();
  backend?.addBodyWeight(iso, value).catch(() => { /* offline */ });
}

export function addMeasurement(key: string, value: number): void {
  const iso = fmtISO(TODAY);
  const arr = (data.measurements[key] || []).filter((m) => m.date !== iso).concat({ date: iso, value });
  arr.sort((a, b) => a.date.localeCompare(b.date));
  data = { ...data, measurements: { ...data.measurements, [key]: arr } };
  persist();
  backend?.addMeasurement(key, iso, value).catch(() => { /* offline */ });
}

/** note de séance d'un jour (texte vide = suppression) */
export function setNote(iso: string, text: string): void {
  const t = text.trim();
  const notes = { ...data.notes };
  if (t) notes[iso] = t; else delete notes[iso];
  data = { ...data, notes };
  persist();
  backend?.setNote(iso, t).catch(() => { /* offline */ });
}

/** seed initial body weight from onboarding (only if none yet) */
export function seedBodyWeight(value: number): void {
  if (data.bodyWeight.length === 0) addBodyWeight(value);
}

export function lastWeight(exId: string): number | null {
  return data.lastWeights[exId] ?? null;
}

/** prescription IA (calque) pour un exercice, ou null si le programme de base s'applique */
export function prescription(exId: string): Prescription | null {
  return data.plan[exId] ?? null;
}
export function prescribedWeight(exId: string): number | null {
  return data.plan[exId]?.targetWeight ?? null;
}

// ---------- sélecteurs dérivés ----------
export interface ActionableDay { day: Day; status: 'upcoming' | 'today' | 'next' | 'finished'; }

export function actionableDay(d: StoreData): ActionableDay {
  if (!programStarted) return { day: firstSession, status: 'upcoming' };
  const todayIso = fmtISO(TODAY);
  const todayDay = allDays.find((x) => x.iso === todayIso);
  if (todayDay && !d.sessions[todayDay.iso]) return { day: todayDay, status: 'today' };
  const next = allDays.find((x) => x.date >= TODAY && !d.sessions[x.iso]);
  if (next) return { day: next, status: next.iso === todayIso ? 'today' : 'next' };
  return { day: allDays[allDays.length - 1], status: 'finished' };
}

export function streak(d: StoreData): number {
  const past = allDays.filter((x) => x.date <= TODAY).sort((a, b) => b.date.getTime() - a.date.getTime());
  let n = 0;
  for (const x of past) {
    if (d.sessions[x.iso]) n++;
    else if (x.iso === fmtISO(TODAY)) continue; // aujourd'hui pas encore fait → n'interrompt pas
    else break;
  }
  return n;
}

export function completedCount(d: StoreData): number {
  return Object.keys(d.sessions).length;
}
export function totalVolume(d: StoreData): number {
  return Object.values(d.sessions).reduce((a, s) => a + (s.volume || 0), 0);
}

export interface WeekVol { week: number; volume: number; done: number; planned: number; }
export function weeklyVolume(d: StoreData): WeekVol[] {
  return weeks.map((w) => {
    let volume = 0, done = 0;
    w.days.forEach((day) => {
      const s = d.sessions[day.iso];
      if (s) { volume += s.volume || 0; done++; }
    });
    return { week: w.number, volume, done, planned: w.days.length };
  });
}

export interface LiftPt { week: number; value: number; }
export interface LiftSerie { id: string; name: string; color: string; points: LiftPt[]; }
export function liftSeries(d: StoreData): LiftSerie[] {
  return KEY_LIFTS.map((lift) => {
    const points: LiftPt[] = [];
    Object.values(d.sessions)
      .sort((a, b) => a.iso.localeCompare(b.iso))
      .forEach((s) => {
        const ex = s.exercises.find((e) => e.id === lift.id);
        if (ex) {
          const top = Math.max(0, ...ex.sets.map((st) => st.weight || 0));
          if (top) points.push({ week: isoToWeek[s.iso] || 1, value: top });
        }
      });
    return { ...lift, points };
  });
}

export interface SessionRow { day: Day; session: LoggedSession; }
export function sessionList(d: StoreData): SessionRow[] {
  const byIso: Record<string, Day> = {};
  allDays.forEach((x) => { byIso[x.iso] = x; });
  return Object.values(d.sessions)
    .filter((s) => byIso[s.iso])
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .map((s) => ({ day: byIso[s.iso], session: s }));
}

export interface MeasureView { zone: string; key: string; values: number[]; current: number | null; delta: number | null; }
export function measurementViews(d: StoreData): MeasureView[] {
  return MEASURE_DEFS.map((m) => {
    const entries = d.measurements[m.key] || [];
    const values = entries.map((e) => e.value);
    const current = values.length ? values[values.length - 1] : null;
    const delta = values.length >= 2 ? +(values[values.length - 1] - values[0]).toFixed(1) : null;
    return { zone: m.zone, key: m.key, values, current, delta };
  });
}

// ---------- rattrapage des séances manquées + planning ajusté ----------

/** Séances d'entraînement passées non complétées (manquées), de la + ancienne à la + récente. */
export function missedDays(d: StoreData): Day[] {
  if (!programStarted) return [];
  return allDays
    .filter((x) => x.date < TODAY && !d.sessions[x.iso])
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface CatchUpItem { day: Day; projectedDate: Date; projectedIso: string; missed: boolean; }
/** Replanifie les séances non faites (manquées + à venir) sur les prochains jours
 *  d'entraînement à partir d'aujourd'hui. Projection pure : n'écrit rien dans le store. */
export function catchUpPlan(d: StoreData): CatchUpItem[] {
  const undone = allDays
    .filter((x) => !d.sessions[x.iso])
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  let cursor = TODAY;
  return undone.map((day) => {
    const projectedDate = nextTrainingDate(cursor);
    cursor = addDays(projectedDate, 1);
    return { day, projectedDate, projectedIso: fmtISO(projectedDate), missed: day.date < TODAY };
  });
}

/** Retard (en jours) avec lequel une séance a été rattrapée (faite après sa date planifiée), sinon null. */
export function caughtUpDelay(day: Day, s: LoggedSession): number | null {
  const delay = daysBetween(day.date, new Date(s.finishedAt));
  return delay > 0 ? delay : null;
}

/** Contexte de planning transmis au Coach IA pour adapter charges + reprise. */
export interface ScheduleContext {
  todayIso: string;
  currentWeek: number;
  plannedToDate: number;
  doneToDate: number;
  missedCount: number;
  missedRecent: { iso: string; name: string }[];
  daysSinceLast: number | null;
}
export function scheduleContext(d: StoreData): ScheduleContext {
  // assiduité à ce jour (strictement passé) → planned = done + manquées
  const planned = allDays.filter((x) => x.date < TODAY).length;
  const done = allDays.filter((x) => x.date < TODAY && d.sessions[x.iso]).length;
  const missed = missedDays(d);
  const last = Object.values(d.sessions).sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  return {
    todayIso: fmtISO(TODAY),
    currentWeek,
    plannedToDate: planned,
    doneToDate: done,
    missedCount: missed.length,
    missedRecent: missed.slice(-5).map((x) => ({ iso: x.iso, name: x.short })),
    daysSinceLast: last ? daysBetween(new Date(last.finishedAt), TODAY) : null,
  };
}

// ---------- progression par exercice + 1RM estimé ----------

/** 1RM estimé (formule d'Epley) à partir d'une série poids × reps. */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export interface ExercisePoint { iso: string; week: number; topWeight: number; topReps: number; est1RM: number; }
/** Historique chronologique d'un exercice : meilleure charge, meilleures reps et 1RM estimé par séance. */
export function exerciseProgress(d: StoreData, exId: string): ExercisePoint[] {
  const pts: ExercisePoint[] = [];
  Object.values(d.sessions)
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .forEach((s) => {
      const ex = s.exercises.find((e) => e.id === exId);
      if (!ex) return;
      let topWeight = 0, topReps = 0, est = 0;
      for (const st of ex.sets) {
        if (st.weight != null) {
          topWeight = Math.max(topWeight, st.weight);
          est = Math.max(est, estimate1RM(st.weight, st.reps));
        }
        topReps = Math.max(topReps, st.reps);
      }
      pts.push({ iso: s.iso, week: isoToWeek[s.iso] || 1, topWeight, topReps, est1RM: est });
    });
  return pts;
}
