/* FitForge — Journal (historique & analytics réels) */
import React from 'react';
import { FFIcon } from '../components/icons';
import { FFBadge, Segmented, ConsistencyHeatmap } from '../components/ui';
import * as FF from '../data/program';
import { useStore, weeklyVolume, liftSeries, sessionList, setNote } from '../data/store';
import type { WeekVol, LiftSerie } from '../data/store';

function fmtMin(sec: number): string {
  return `${Math.round(sec / 60)} min`;
}

function VolumeBarChart({ data }: { data: WeekVol[] }) {
  const max = Math.max(...data.map((d) => d.volume), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 110 }}>
      {data.map((d) => (
        <div key={d.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', maxWidth: 22, borderRadius: 5,
            height: `${Math.max(3, (d.volume / max) * 100)}%`,
            background: d.volume ? 'linear-gradient(180deg, var(--accent), rgba(0,240,255,0.35))' : 'var(--bg-2)',
            boxShadow: d.volume ? '0 0 calc(10px * var(--glow)) rgba(0,240,255,0.2)' : 'none',
            transition: 'height var(--dur-slow) cubic-bezier(0.22,1,0.36,1)',
          }}></div>
          <span className="ff-mono" style={{ fontSize: 9, color: 'var(--txt-2)' }}>S{d.week}</span>
        </div>
      ))}
    </div>
  );
}

function LiftChart({ series, active, maxWeek }: { series: LiftSerie[]; active: Set<string>; maxWeek: number }) {
  const W = 320, H = 130;
  const visible = series.filter((s) => active.has(s.id) && s.points.length >= 2);
  const allVals = visible.flatMap((s) => s.points.map((p) => p.value));
  if (!allVals.length) {
    return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-2)', fontSize: 12, textAlign: 'center', padding: '0 20px' }}>
      Logue au moins 2 séances avec charge pour voir la progression
    </div>;
  }
  const min = Math.min(...allVals) - 2, max = Math.max(...allVals) + 2;
  const px = (w: number) => 10 + ((w - 1) / Math.max(1, maxWeek - 1)) * (W - 20);
  const py = (v: number) => H - 18 - ((v - min) / (max - min)) * (H - 34);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#161616" strokeWidth="1" />)}
      {visible.map((s) => {
        const byWeek: Record<number, number> = {};
        s.points.forEach((p) => { byWeek[p.week] = Math.max(byWeek[p.week] || 0, p.value); });
        const pts = Object.entries(byWeek).map(([w, v]) => ({ w: +w, v })).sort((a, b) => a.w - b.w);
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.w).toFixed(1)},${py(p.v).toFixed(1)}`).join(' ');
        return (
          <g key={s.id}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p) => <circle key={p.w} cx={px(p.w)} cy={py(p.v)} r="3" fill="var(--bg-0)" stroke={s.color} strokeWidth="1.6" />)}
          </g>
        );
      })}
      {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => <text key={w} x={px(w)} y={H - 4} textAnchor="middle" fill="#4A4A4A" fontSize="9" fontFamily="JetBrains Mono">S{w}</text>)}
    </svg>
  );
}

/* ---------- note de séance (carnet) ---------- */
function SessionNote({ iso, note }: { iso: string; note: string }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note);
  React.useEffect(() => { setDraft(note); }, [note]);

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus rows={3}
          placeholder="Ressenti, douleurs, observations…"
          style={{ width: '100%', resize: 'vertical', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px', fontSize: 13, color: 'var(--txt-0)', outline: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5 }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="pressable ff-label" onClick={() => { setDraft(note); setEditing(false); }}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid var(--line)', color: 'var(--txt-1)', fontSize: 11 }}>Annuler</button>
          <button className="pressable ff-label" onClick={() => { setNote(iso, draft); setEditing(false); }}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid rgba(0,240,255,0.35)', color: 'var(--accent)', fontSize: 11 }}>Enregistrer</button>
        </div>
      </div>
    );
  }
  if (note) {
    return (
      <button className="pressable" onClick={() => setEditing(true)} aria-label="Éditer la note"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--line)', textAlign: 'left', width: '100%' }}>
        <FFIcon name="edit" size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12.5, color: 'var(--txt-1)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{note}</span>
      </button>
    );
  }
  return (
    <button className="pressable ff-label" onClick={() => setEditing(true)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, padding: '7px 11px', borderRadius: 9, border: '1px dashed var(--line)', color: 'var(--txt-2)', fontSize: 10.5, alignSelf: 'flex-start' }}>
      <FFIcon name="edit" size={12} /> Ajouter une note
    </button>
  );
}

export function JournalScreen({ desktop = false }: { desktop?: boolean }) {
  const data = useStore();
  const [period, setPeriod] = React.useState('Mois');
  const [active, setActive] = React.useState<Set<string>>(new Set(['dev-incline', 'squat-guide']));
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const allVol = weeklyVolume(data);
  const series = liftSeries(data);
  const sessions = sessionList(data);
  const maxWeek = Math.max(2, FF.currentWeek);

  const periodWeeks = period === 'Semaine' ? 1 : period === 'Mois' ? 4 : period === '3 Mois' ? 12 : 12;
  const volData = allVol.slice(0, Math.max(4, Math.min(periodWeeks, 12)));

  const toggleLift = (id: string) => setActive((a) => { const s = new Set(a); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: desktop ? 0 : 110 }}>
     <div className={desktop ? 'ff-fluid ff-stagger' : 'ff-stagger'} style={desktop ? { padding: '8px 32px 48px' } : undefined}>
      <header style={{ padding: desktop ? '18px 0 14px' : '26px 20px 14px' }}>
        <h1 className="ff-display" style={{ fontSize: 28, fontWeight: 700 }}>Journal</h1>
      </header>
      <div style={{ padding: desktop ? 0 : '0 20px', maxWidth: desktop ? 460 : undefined }}>
        <Segmented options={['Semaine', 'Mois', '3 Mois', 'Tout']} value={period} onChange={setPeriod} />
      </div>

     <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14, marginTop: 16, alignItems: 'start' } : undefined}>
      <section className="ff-card" style={{ margin: desktop ? 0 : '16px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 14 }}>Volume hebdomadaire · kg</div>
        <VolumeBarChart data={volData} />
      </section>

      <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 12 }}>Lifts clés · charge max</div>
        <LiftChart series={series} active={active} maxWeek={maxWeek} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {series.map((s) => (
            <button key={s.id} className="pressable" onClick={() => toggleLift(s.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999,
              border: `1px solid ${active.has(s.id) ? s.color : 'var(--line)'}`,
              background: active.has(s.id) ? `${s.color}14` : 'transparent',
              color: active.has(s.id) ? 'var(--txt-0)' : 'var(--txt-2)', fontSize: 11.5, fontWeight: 600,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }}></span>
              {s.name}
            </button>
          ))}
        </div>
      </section>

      <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
        <div className="ff-label" style={{ marginBottom: 14 }}>Consistance · 12 semaines</div>
        <ConsistencyHeatmap cell={15} gap={4} />
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'var(--txt-1)' }}>
          <span><span style={{ color: 'var(--accent-3)' }}>■</span> complétée</span>
          <span><span style={{ color: 'var(--accent-2)' }}>■</span> manquée</span>
          <span><span style={{ color: 'var(--accent)' }}>■</span> aujourd’hui</span>
        </div>
      </section>
     </div>

      <section style={{ margin: desktop ? '24px 0 0' : '22px 20px 0' }}>
        <div className="ff-label" style={{ marginBottom: 12 }}>Séances passées</div>
        {sessions.length === 0 ? (
          <div className="ff-card" style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--txt-2)', fontSize: 13 }}>
            Aucune séance loggée pour l’instant.<br />Termine ta première séance pour la voir ici.
          </div>
        ) : (
          <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 10, alignItems: 'start' } : { display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map(({ day, session }) => {
              const isExp = expanded === day.iso;
              return (
                <div key={day.iso} className="ff-card">
                  <button className="pressable" onClick={() => setExpanded(isExp ? null : day.iso)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{day.name}</div>
                      <div className="ff-mono" style={{ fontSize: 11, color: 'var(--txt-2)', marginTop: 3, textTransform: 'capitalize' }}>{FF.fmtLong(day.date)} · {fmtMin(session.durationSec)}</div>
                    </div>
                    {session.volume > 0 && <span className="ff-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{(session.volume / 1000).toFixed(1)} t</span>}
                    <FFIcon name="chevronD" size={14} color="var(--txt-2)" style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
                  </button>
                  {isExp && (
                    <div className="anim-fade-in" style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {session.exercises.map((ex) => (
                        <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--txt-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</span>
                          <span className="ff-mono" style={{ fontSize: 11.5, color: 'var(--txt-0)', flexShrink: 0 }}>
                            {ex.sets.map((st) => st.weight ? `${st.weight}×${st.reps}` : `${st.reps}`).slice(0, 4).join(' · ')}
                          </span>
                        </div>
                      ))}
                      {session.prs.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {session.prs.slice(0, 3).map((pr, i) => (
                            <FFBadge key={i} color="var(--accent-3)" bg="rgba(57,255,20,0.08)">PR · {pr.exercise} {pr.next} kg</FFBadge>
                          ))}
                        </div>
                      )}
                      <SessionNote iso={day.iso} note={data.notes[day.iso] || ''} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
     </div>
    </div>
  );
}
