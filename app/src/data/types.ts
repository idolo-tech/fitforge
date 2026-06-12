/* FitForge — shared domain types */

export type PhaseId = 'adaptation' | 'volume' | 'definition';

export interface Phase {
  id: PhaseId;
  name: string;
  /** inclusive [firstWeek, lastWeek] */
  weeks: [number, number];
  rir: string;
  principle: string;
  cardio: string;
  progression: string;
  /** consigne nutrition propre à la phase (issue du PDF) */
  nutrition: string;
}

/** Exercise as defined by the program. Loads are NOT prescribed by the plan —
 *  the user enters them during the session (the store remembers the last one). */
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: number;
  /** true = external load (gym) → show weight input ; false = bodyweight / time */
  weighted: boolean;
  note: string;
  /** demo frames (free-exercise-db, public domain). Empty/absent → living placeholder. */
  images?: string[];
}

export interface Day {
  id: string;
  week: number;
  weekday: number;
  date: Date;
  iso: string;
  name: string;
  short: string;
  location: string;
  cardio: string;
  exercises: Exercise[];
}

export interface Week {
  number: number;
  monday: Date;
  phase: Phase;
  days: Day[];
}

export interface HistorySet {
  set: number;
  weight: number | null;
  reps: number;
  rir: number;
}

export interface HistoryExercise {
  id: string;
  name: string;
  sets: HistorySet[];
}

export interface HistoryPR {
  exercise: string;
  type: string;
  prev: number;
  next: number;
}

export interface SessionRecord {
  status: 'completed' | 'missed';
  volume?: number;
  duration?: number;
  exercises?: HistoryExercise[];
  prs?: HistoryPR[];
  avgRir?: number;
}

export interface WeeklyVolume {
  week: number;
  volume: number;
  done: number;
  planned: number;
}

export interface LiftPoint {
  week: number;
  value: number;
}

export interface LiftSeries {
  id: string;
  name: string;
  color: string;
  points: LiftPoint[];
}

export interface BodyWeightPoint {
  date: Date;
  value: number;
}

export interface LastPR {
  exercise: string;
  prev: number;
  next: number;
  date: Date;
  unit: string;
}

export interface Measurement {
  zone: string;
  key: string;
  values: number[];
  goal: number;
}

export interface User {
  name: string;
  initials: string;
  weight: number;
  height: number;
  goal: string;
  proteinGoal: number;
}

/** Shape produced by the WorkoutPlayer and consumed by the Summary screen. */
export interface SessionSummary {
  dayName: string;
  volume: number;
  duration: string;
  prCount: number;
  kcal: number;
  intensity: number[];
  comparison: { label: string; value: string; delta: number }[];
}
