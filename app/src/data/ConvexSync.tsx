/* FitForge — pont Convex ↔ store local.
   Monté sous ConvexAuthProvider + <Authenticated>. Ne rend rien : il branche
   les mutations Convex sur le store et fusionne les données du cloud dans le
   store synchrone. Le userId est dérivé côté serveur (getAuthUserId). */
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getData, setCloudBackend, hydrateFromCloud } from './store';
import type { StoreData, LoggedSession, BodyEntry, MeasureEntry } from './store';

export function ConvexSync() {
  const saveMut = useMutation(api.sessions.save);
  const addBodyMut = useMutation(api.body.add);
  const addMeasureMut = useMutation(api.measurements.add);
  const setNoteMut = useMutation(api.notes.set);

  const toSaveArgs = React.useCallback(
    (s: LoggedSession) => ({
      iso: s.iso, dayId: s.dayId, dayName: s.dayName,
      finishedAt: s.finishedAt, durationSec: s.durationSec,
      volume: s.volume, avgRir: s.avgRir,
      exercises: s.exercises, prs: s.prs,
    }),
    [],
  );

  // expose les mutations Convex au store (signatures CloudBackend)
  React.useEffect(() => {
    setCloudBackend({
      saveSession: (s) => saveMut(toSaveArgs(s)),
      addBodyWeight: (date, value) => addBodyMut({ date, value }),
      addMeasurement: (key, date, value) => addMeasureMut({ key, date, value }),
      setNote: (iso, text) => setNoteMut({ iso, text }),
    });
    return () => setCloudBackend(null);
  }, [saveMut, addBodyMut, addMeasureMut, setNoteMut, toSaveArgs]);

  // lectures réactives temps réel (rattachées au compte connecté)
  const sessions = useQuery(api.sessions.list, {});
  const body = useQuery(api.body.list, {});
  const measures = useQuery(api.measurements.list, {});
  const lastWeights = useQuery(api.sessions.lastWeights, {});
  const notes = useQuery(api.notes.list, {});

  const ready =
    sessions !== undefined && body !== undefined &&
    measures !== undefined && lastWeights !== undefined && notes !== undefined;
  const pushedRef = React.useRef(false);

  React.useEffect(() => {
    if (!sessions || !body || !measures || !lastWeights || !notes) return;

    const cloud: StoreData = {
      sessions: Object.fromEntries(
        sessions.map((s): [string, LoggedSession] => [s.iso, {
          iso: s.iso, dayId: s.dayId, dayName: s.dayName,
          finishedAt: s.finishedAt, durationSec: s.durationSec,
          volume: s.volume, avgRir: s.avgRir,
          exercises: s.exercises, prs: s.prs,
        }]),
      ),
      bodyWeight: body.map((b): BodyEntry => ({ date: b.date, value: b.value })),
      measurements: measures.reduce<Record<string, MeasureEntry[]>>((acc, m) => {
        (acc[m.key] ||= []).push({ date: m.date, value: m.value });
        return acc;
      }, {}),
      lastWeights,
      notes: Object.fromEntries(notes.map((n) => [n.iso, n.text])),
    };

    // migration unique : pousse vers le compte les données locales absentes
    if (!pushedRef.current) {
      pushedRef.current = true;
      const local = getData();
      for (const [iso, s] of Object.entries(local.sessions)) {
        if (!cloud.sessions[iso]) saveMut(toSaveArgs(s)).catch(() => {});
      }
      const cloudDates = new Set(cloud.bodyWeight.map((b) => b.date));
      for (const b of local.bodyWeight) {
        if (!cloudDates.has(b.date)) addBodyMut({ date: b.date, value: b.value }).catch(() => {});
      }
      for (const [key, arr] of Object.entries(local.measurements)) {
        const seen = new Set((cloud.measurements[key] || []).map((m) => m.date));
        for (const m of arr) {
          if (!seen.has(m.date)) addMeasureMut({ key, date: m.date, value: m.value }).catch(() => {});
        }
      }
      for (const [iso, text] of Object.entries(local.notes)) {
        if (!cloud.notes[iso]) setNoteMut({ iso, text }).catch(() => {});
      }
    }

    hydrateFromCloud(cloud);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sessions, body, measures, lastWeights, notes]);

  return null;
}
