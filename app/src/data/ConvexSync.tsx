/* FitForge — pont Convex ↔ store local.
   Monté sous ConvexProvider. Ne rend rien : il branche les mutations Convex
   sur le store et fusionne les données du cloud dans le store synchrone. */
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getUserId } from './userId';
import { getData, setCloudBackend, hydrateFromCloud } from './store';
import type { StoreData, LoggedSession, BodyEntry, MeasureEntry } from './store';

export function ConvexSync() {
  const [userId] = React.useState(getUserId);

  const saveMut = useMutation(api.sessions.save);
  const addBodyMut = useMutation(api.body.add);
  const addMeasureMut = useMutation(api.measurements.add);

  const toSaveArgs = React.useCallback(
    (s: LoggedSession) => ({
      userId,
      iso: s.iso, dayId: s.dayId, dayName: s.dayName,
      finishedAt: s.finishedAt, durationSec: s.durationSec,
      volume: s.volume, avgRir: s.avgRir,
      exercises: s.exercises, prs: s.prs,
    }),
    [userId],
  );

  // expose les mutations Convex au store (signatures CloudBackend)
  React.useEffect(() => {
    setCloudBackend({
      saveSession: (s) => saveMut(toSaveArgs(s)),
      addBodyWeight: (date, value) => addBodyMut({ userId, date, value }),
      addMeasurement: (key, date, value) => addMeasureMut({ userId, key, date, value }),
    });
    return () => setCloudBackend(null);
  }, [userId, saveMut, addBodyMut, addMeasureMut, toSaveArgs]);

  // lectures réactives temps réel
  const sessions = useQuery(api.sessions.list, { userId });
  const body = useQuery(api.body.list, { userId });
  const measures = useQuery(api.measurements.list, { userId });
  const lastWeights = useQuery(api.sessions.lastWeights, { userId });

  const ready =
    sessions !== undefined && body !== undefined &&
    measures !== undefined && lastWeights !== undefined;
  const pushedRef = React.useRef(false);

  React.useEffect(() => {
    if (!sessions || !body || !measures || !lastWeights) return;

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
    };

    // migration unique : pousse vers le cloud les données locales absentes
    if (!pushedRef.current) {
      pushedRef.current = true;
      const local = getData();
      for (const [iso, s] of Object.entries(local.sessions)) {
        if (!cloud.sessions[iso]) saveMut(toSaveArgs(s)).catch(() => {});
      }
      const cloudDates = new Set(cloud.bodyWeight.map((b) => b.date));
      for (const b of local.bodyWeight) {
        if (!cloudDates.has(b.date)) addBodyMut({ userId, date: b.date, value: b.value }).catch(() => {});
      }
      for (const [key, arr] of Object.entries(local.measurements)) {
        const seen = new Set((cloud.measurements[key] || []).map((m) => m.date));
        for (const m of arr) {
          if (!seen.has(m.date)) addMeasureMut({ userId, key, date: m.date, value: m.value }).catch(() => {});
        }
      }
    }

    hydrateFromCloud(cloud);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sessions, body, measures, lastWeights]);

  return null;
}
