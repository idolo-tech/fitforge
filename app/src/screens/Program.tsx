/* FitForge — Programme (timeline 12 semaines) + vue jour */
import React from 'react';
import { FFIcon } from '../components/icons';
import { NeonButton, FFBadge } from '../components/ui';
import * as FF from '../data/program';
import { useStore, lastWeight } from '../data/store';
import type { Day } from '../data/types';

function DayDetail({ day, onClose, onStart }: { day: Day; onClose: () => void; onStart: () => void }) {
  const { TODAY } = FF;
  const data = useStore();
  const s = data.sessions[day.iso];
  const isToday = day.iso === FF.fmtISO(TODAY);
  const [note, setNote] = React.useState('');
  return (
    <div className="anim-fade-in" style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div className="anim-fade-up" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '86%', background: 'var(--bg-1)', borderRadius: '24px 24px 0 0',
        border: '1px solid var(--line)', borderBottom: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--bg-2)', margin: '12px auto 0' }}></div>
        <div style={{ padding: '16px 22px 10px' }}>
          <div className="ff-label" style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{FF.fmtLong(day.date)}</div>
          <h2 className="ff-display" style={{ fontSize: 23, fontWeight: 700, marginTop: 6 }}>{day.name}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <FFBadge>{day.location}</FFBadge>
            <FFBadge>{day.exercises.length} exercices</FFBadge>
            {s && <FFBadge color="var(--accent-3)" bg="rgba(57,255,20,0.1)"><FFIcon name="check" size={12} /> Complétée</FFBadge>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {day.exercises.map((ex) => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 13px', background: 'var(--bg-2)', borderRadius: 13 }}>
              <a href={FF.exerciseDemoUrl(ex.name)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="ff-placeholder pressable" aria-label={`Voir la démo : ${ex.name}`}
                style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {ex.images?.[0] && (
                  <img src={ex.images[0]} alt="" loading="lazy" decoding="async"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.25) brightness(0.62)' }} />
                )}
                <FFIcon name="play" size={16} color="var(--accent)" style={{ position: 'relative' }} />
              </a>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                <div className="ff-mono" style={{ fontSize: 11.5, color: 'var(--txt-1)', marginTop: 2 }}>
                  {ex.sets} × {ex.reps}{ex.weighted ? (lastWeight(ex.id) != null ? ` · ${lastWeight(ex.id)} kg` : ' · charge libre') : ''}
                </div>
              </div>
              <a href={FF.exerciseDemoUrl(ex.name)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="ff-label pressable" aria-label={`Voir la démo : ${ex.name}`}
                style={{ fontSize: 9.5, color: 'var(--accent)', border: '1px solid var(--line)', borderRadius: 8, padding: '5px 8px', flexShrink: 0, textDecoration: 'none' }}>
                ▶ DÉMO
              </a>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--txt-2)', padding: '4px 2px' }} className="ff-mono">+ {day.cardio}</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…"
            aria-label="Note de séance"
            style={{ background: 'transparent', border: '1px dashed var(--line)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--txt-0)', outline: 'none' }} />
        </div>
        {!s && (
          <div style={{ padding: '10px 22px calc(18px + env(safe-area-inset-bottom))' }}>
            <NeonButton onClick={onStart}>{isToday ? 'DÉMARRER CETTE SÉANCE' : 'FAIRE CETTE SÉANCE'}</NeonButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgramScreen({ onStartWorkout, desktop = false }: { onStartWorkout: (d: Day) => void; desktop?: boolean }) {
  const { weeks, TODAY, fmtISO, currentWeek } = FF;
  const data = useStore();
  const [open, setOpen] = React.useState<Set<number>>(new Set([currentWeek]));
  const [selDay, setSelDay] = React.useState<Day | null>(null);
  const toggle = (n: number) => setOpen((o) => { const s = new Set(o); s.has(n) ? s.delete(n) : s.add(n); return s; });

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: desktop ? 0 : 110 }}>
     <div className={desktop ? 'ff-fluid ff-stagger' : 'ff-stagger'} style={desktop ? { padding: '8px 32px 48px' } : undefined}>
      <header style={{ padding: desktop ? '18px 0 4px' : '26px 20px 4px' }}>
        <h1 className="ff-display" style={{ fontSize: 28, fontWeight: 700 }}>Programme</h1>
        <p style={{ fontSize: 13, color: 'var(--txt-1)', marginTop: 6 }}>Carrure + Définition · 15 juin → 14 sept. 2026</p>
      </header>

      {/* objectif */}
      <section className="ff-card" style={{ margin: desktop ? '14px 0 0' : '14px 20px 0', padding: 16 }}>
        <div className="ff-label" style={{ color: 'var(--accent)', marginBottom: 10 }}>Objectif</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {FF.PROGRAM_GOAL.map((g) => (
            <div key={g} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)', fontSize: 13, lineHeight: '20px' }}>▸</span>
              <span style={{ fontSize: 13.5, color: 'var(--txt-0)', lineHeight: 1.45 }}>{g}</span>
            </div>
          ))}
        </div>
      </section>

      {/* phases */}
      <div style={{ display: 'flex', gap: 8, padding: desktop ? '14px 0 4px' : '14px 20px 4px', overflowX: 'auto' }}>
        {FF.PHASES.map((p, i) => {
          const active = currentWeek >= p.weeks[0] && currentWeek <= p.weeks[1];
          return (
            <div key={p.id} className="ff-card" style={{ minWidth: 210, maxWidth: 240, padding: 13, flexShrink: 0, borderColor: active ? 'rgba(0,240,255,0.3)' : 'var(--line)', boxShadow: active ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.08)' : 'none' }}>
              <div className="ff-label" style={{ fontSize: 9.5, color: active ? 'var(--accent)' : 'var(--txt-2)' }}>Phase {i + 1} · S{p.weeks[0]}-{p.weeks[1]}</div>
              <div className="ff-display" style={{ fontSize: 14, fontWeight: 600, marginTop: 5 }}>{p.name}</div>
              <div className="ff-mono" style={{ fontSize: 10.5, color: 'var(--txt-1)', marginTop: 4 }}>{p.rir}</div>
              <div style={{ fontSize: 10.5, color: 'var(--txt-2)', marginTop: 8, lineHeight: 1.4 }}>{p.nutrition}</div>
            </div>
          );
        })}
      </div>

      {/* timeline */}
      <div style={desktop
        ? { padding: '16px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 12, alignItems: 'start' }
        : { padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weeks.map((w) => {
          const isOpen = open.has(w.number);
          const isCurrent = w.number === currentWeek;
          const doneCount = w.days.filter((d) => data.sessions[d.iso]).length;
          return (
            <div key={w.number} className="ff-card" style={{
              borderLeft: isCurrent ? '2px solid var(--accent)' : '1px solid var(--line)',
              boxShadow: isCurrent ? '0 0 calc(20px * var(--glow)) rgba(0,240,255,0.07)' : 'none',
            }}>
              <button onClick={() => toggle(w.number)} className="pressable" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 17px', textAlign: 'left' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="ff-display" style={{ fontSize: 16, fontWeight: 600 }}>
                    Semaine {w.number}
                    {isCurrent && <span className="ff-mono" style={{ marginLeft: 8, fontSize: 9.5, color: 'var(--accent)', border: '1px solid rgba(0,240,255,0.4)', padding: '2px 7px', borderRadius: 5 }}>EN COURS</span>}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--txt-2)' }}>{w.phase.name} · {FF.fmtShort(w.monday)}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ff-mono" style={{ fontSize: 12, color: doneCount === 4 ? 'var(--accent-3)' : 'var(--txt-2)' }}>{w.monday < TODAY ? `${doneCount}/4` : ''}</span>
                  <FFIcon name="chevronD" size={15} color="var(--txt-2)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
                </span>
              </button>
              {isOpen && (
                <div className="anim-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 14px 14px' }}>
                  {w.days.map((d) => {
                    const s = data.sessions[d.iso];
                    const isToday = d.iso === fmtISO(TODAY);
                    const done = !!s;
                    const missed = !s && d.date < TODAY;
                    return (
                      <button key={d.id} className="pressable" onClick={() => setSelDay(d)} style={{
                        padding: '12px 12px', borderRadius: 12, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                        background: done ? 'rgba(57,255,20,0.05)' : 'var(--bg-2)',
                        border: `1px solid ${isToday ? 'var(--accent)' : missed ? 'rgba(255,61,113,0.3)' : done ? 'rgba(57,255,20,0.18)' : 'var(--line)'}`,
                        boxShadow: isToday ? '0 0 calc(14px * var(--glow)) rgba(0,240,255,0.13)' : 'none',
                        animation: isToday ? 'ff-pulse-soft calc(3s * var(--speed)) ease-in-out infinite' : 'none',
                      }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="ff-label" style={{ fontSize: 9.5, color: isToday ? 'var(--accent)' : 'var(--txt-2)' }}>
                            {FF.DAYS_FR_SHORT[d.date.getDay()]} {d.date.getDate()}
                          </span>
                          {done && <FFIcon name="check" size={12} color="var(--accent-3)" strokeWidth={2.6} />}
                          {missed && <FFIcon name="close" size={11} color="var(--accent-2)" strokeWidth={2} />}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>{d.short}</span>
                        <span style={{ fontSize: 10, color: 'var(--txt-2)' }}>{d.location} · {d.exercises.length} exos</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* alimentation + conseils */}
      <div style={desktop ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14, marginTop: 24, alignItems: 'start' } : undefined}>
        {/* alimentation */}
        <section className="ff-card" style={{ margin: desktop ? 0 : '24px 20px 0', padding: 18 }}>
          <div className="ff-label" style={{ color: 'var(--accent)', marginBottom: 14 }}>Alimentation clé</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {FF.NUTRITION_KEY.map((n) => (
              <div key={n.k} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span className="ff-display" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt-0)', minWidth: 86, flexShrink: 0 }}>{n.k}</span>
                <span style={{ fontSize: 12.5, color: 'var(--txt-1)', lineHeight: 1.45 }}>{n.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* conseils */}
        <section className="ff-card" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 18 }}>
          <div className="ff-label" style={{ color: 'var(--accent)', marginBottom: 14 }}>Conseils pour réussir</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)' }}>
              <div className="ff-label" style={{ fontSize: 10, color: 'var(--accent-3)', marginBottom: 6 }}>Règle de progression · Phase 2 & 3</div>
              <div style={{ fontSize: 12.5, color: 'var(--txt-0)', lineHeight: 1.5 }}>{FF.PROGRESSION_RULE}</div>
            </div>
            {FF.TIPS.map((t) => (
              <div key={t.title}>
                <div className="ff-display" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--txt-1)', lineHeight: 1.5 }}>{t.text}</div>
              </div>
            ))}
            <div>
              <div className="ff-display" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>Le visage</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {FF.FACE_TIPS.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--txt-2)', fontSize: 12, lineHeight: '18px' }}>▸</span>
                    <span style={{ fontSize: 12.5, color: 'var(--txt-1)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
     </div>
      {selDay && <DayDetail day={selDay} onClose={() => setSelDay(null)} onStart={() => { const d = selDay; setSelDay(null); onStartWorkout(d); }} />}
    </div>
  );
}
