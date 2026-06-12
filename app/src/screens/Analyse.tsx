/* FitForge — Analyse : dashboard de progression (Recharts) + prédictions + alertes.
   100% côté client à partir des données du store. */
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { FFIcon } from '../components/icons';
import { ConsistencyHeatmap } from '../components/ui';
import { useStore, weeklyVolume, liftSeries } from '../data/store';
import type { LiftSerie } from '../data/store';
import * as FF from '../data/program';

/* régression linéaire simple (moindres carrés) */
function linreg(pts: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  const n = pts.length;
  if (n < 2) return null;
  const sx = pts.reduce((a, p) => a + p.x, 0);
  const sy = pts.reduce((a, p) => a + p.y, 0);
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0);
  const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
  const d = n * sxx - sx * sx;
  if (d === 0) return null;
  const slope = (n * sxy - sx * sy) / d;
  return { slope, intercept: (sy - slope * sx) / n };
}

function ChartTooltip({ active, payload, label, unit = '' }: { active?: boolean; payload?: { value: number; color: string }[]; label?: number | string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--glass)', border: '1px solid var(--line)', borderRadius: 10, padding: '7px 10px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="ff-label" style={{ fontSize: 9, marginBottom: 2 }}>Semaine {label}</div>
      {payload.filter((p) => p.value != null).map((p, i) => (
        <div key={i} className="ff-mono" style={{ fontSize: 12.5, fontWeight: 700, color: p.color }}>{p.value}{unit}</div>
      ))}
    </div>
  );
}

const axisTick = { fontSize: 10, fill: 'var(--txt-2)', fontFamily: 'var(--font-mono)' };

export function AnalyseScreen({ desktop = false }: { desktop?: boolean }) {
  const data = useStore();
  const lifts = liftSeries(data).filter((s) => s.points.length >= 2);
  const vol = weeklyVolume(data);

  const [sel, setSel] = React.useState<string | null>(null);
  const selLift: LiftSerie | undefined = lifts.find((l) => l.id === sel) ?? lifts[0];

  // ---- prédiction sur le lift sélectionné ----
  const pred = React.useMemo(() => {
    if (!selLift) return null;
    const byWeek = new Map<number, number>();
    selLift.points.forEach((p) => byWeek.set(p.week, Math.max(byWeek.get(p.week) ?? 0, p.value)));
    const pts = [...byWeek.entries()].map(([week, value]) => ({ week, value })).sort((a, b) => a.week - b.week);
    const reg = linreg(pts.map((p) => ({ x: p.week, y: p.value })));
    const lastWeek = pts[pts.length - 1].week;
    const lastVal = pts[pts.length - 1].value;
    const predWeek = lastWeek + 2;
    const predVal = reg ? Math.round((reg.slope * predWeek + reg.intercept) * 2) / 2 : null;
    const chart: { week: number; value: number | null; proj: number | null }[] =
      pts.map((p) => ({ week: p.week, value: p.value, proj: null }));
    if (predVal != null && predVal > 0) {
      chart[chart.length - 1].proj = lastVal;
      chart.push({ week: predWeek, value: null, proj: predVal });
    }
    return { chart, predWeek, predVal, lastVal };
  }, [selLift]);

  // ---- alertes heuristiques ----
  const alerts: string[] = React.useMemo(() => {
    const out: string[] = [];
    for (const l of lifts) {
      const byWeek = new Map<number, number>();
      l.points.forEach((p) => byWeek.set(p.week, Math.max(byWeek.get(p.week) ?? 0, p.value)));
      const vals = [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
      if (vals.length >= 3 && vals[vals.length - 1] <= vals[vals.length - 3]) {
        out.push(`${l.name} stagne (${vals[vals.length - 1]} kg) — varie les reps ou tente +2,5 kg.`);
      }
    }
    const done = vol.filter((v) => v.volume > 0);
    if (done.length >= 2) {
      const cur = done[done.length - 1].volume;
      const prevAvg = done.slice(Math.max(0, done.length - 4), done.length - 1).reduce((a, v) => a + v.volume, 0) / Math.max(1, Math.min(3, done.length - 1));
      if (prevAvg > 0 && cur > prevAvg * 1.45) out.push('Volume en forte hausse cette semaine — priorise la récupération.');
    }
    return out.slice(0, 3);
  }, [lifts, vol]);

  const volData = vol.filter((v) => v.week <= FF.currentWeek).map((v) => ({ week: v.week, t: +(v.volume / 1000).toFixed(2) }));
  const noData = lifts.length === 0 && volData.every((v) => v.t === 0);

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: desktop ? 0 : 110 }}>
      <div className={desktop ? 'ff-fluid ff-stagger' : 'ff-stagger'} style={desktop ? { padding: '8px 32px 48px' } : undefined}>
        <header style={{ padding: desktop ? '18px 0 4px' : '26px 20px 4px' }}>
          <h1 className="ff-display" style={{ fontSize: 28, fontWeight: 700 }}>Analyse</h1>
          <p style={{ fontSize: 13, color: 'var(--txt-1)', marginTop: 6 }}>Progression, prédictions et signaux</p>
        </header>

        {noData && (
          <div className="ff-card" style={{ margin: desktop ? '14px 0 0' : '14px 20px 0', padding: '26px 20px', textAlign: 'center', color: 'var(--txt-2)', fontSize: 13 }}>
            Logue quelques séances avec charges pour voir tes courbes et prédictions.
          </div>
        )}

        {alerts.length > 0 && (
          <section style={{ margin: desktop ? '14px 0 0' : '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,61,113,0.06)', border: '1px solid rgba(255,61,113,0.25)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 12.5, color: 'var(--txt-0)', lineHeight: 1.45 }}>{a}</span>
              </div>
            ))}
          </section>
        )}

        {selLift && pred && (
          <section className="ff-card" style={{ margin: desktop ? '16px 0 0' : '16px 20px 0', padding: 18 }}>
            <div className="ff-label" style={{ marginBottom: 12 }}>Progression · charge max</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {lifts.map((l) => {
                const active = l.id === selLift.id;
                return (
                  <button key={l.id} className="pressable" onClick={() => setSel(l.id)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999,
                    border: `1px solid ${active ? l.color : 'var(--line)'}`,
                    background: active ? `${l.color}14` : 'transparent',
                    color: active ? 'var(--txt-0)' : 'var(--txt-2)', fontSize: 11.5, fontWeight: 600,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
                    {l.name}
                  </button>
                );
              })}
            </div>

            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={pred.chart} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#161616" vertical={false} />
                  <XAxis dataKey="week" tick={axisTick} tickFormatter={(w) => `S${w}`} axisLine={{ stroke: '#1F1F1F' }} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} unit=" kg" />
                  <Tooltip content={<ChartTooltip unit=" kg" />} cursor={{ stroke: '#2A2A2A' }} />
                  <Line type="monotone" dataKey="value" stroke={selLift.color} strokeWidth={2.4} dot={{ r: 3, fill: 'var(--bg-0)', stroke: selLift.color, strokeWidth: 1.6 }} activeDot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="proj" stroke={selLift.color} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: selLift.color }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {pred.predVal != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12.5, color: 'var(--txt-1)' }}>
                <FFIcon name={pred.predVal >= pred.lastVal ? 'arrowUp' : 'arrowDown'} size={14} color={pred.predVal >= pred.lastVal ? 'var(--accent-3)' : 'var(--accent-2)'} strokeWidth={2.4} />
                Prédiction (S{pred.predWeek}) : <span className="ff-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>~{pred.predVal} kg</span>
              </div>
            )}
          </section>
        )}

        <section className="ff-card" style={{ margin: desktop ? '16px 0 0' : '16px 20px 0', padding: 18 }}>
          <div className="ff-label" style={{ marginBottom: 12 }}>Volume hebdomadaire · tonnes</div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={volData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#161616" vertical={false} />
                <XAxis dataKey="week" tick={axisTick} tickFormatter={(w) => `S${w}`} axisLine={{ stroke: '#1F1F1F' }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={42} unit=" t" />
                <Tooltip content={<ChartTooltip unit=" t" />} cursor={{ stroke: '#2A2A2A' }} />
                <Area type="monotone" dataKey="t" stroke="#00F0FF" strokeWidth={2.2} fill="url(#volFill)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ff-card" style={{ margin: desktop ? '16px 0 0' : '16px 20px 0', padding: 18 }}>
          <div className="ff-label" style={{ marginBottom: 14 }}>Fréquence · 12 semaines</div>
          <ConsistencyHeatmap cell={desktop ? 16 : 13} gap={4} />
        </section>
      </div>
    </div>
  );
}
