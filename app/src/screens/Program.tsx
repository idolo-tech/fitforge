/* FitForge — Programme (timeline 12 semaines) + vue jour */
import React from 'react';
import { FFIcon } from '../components/icons';
import { NeonButton, FFBadge } from '../components/ui';
import * as FF from '../data/program';
import type { Day } from '../data/types';

function DayDetail({ day, onClose, onStart }: { day: Day; onClose: () => void; onStart: () => void }) {
  const { history, TODAY } = FF;
  const s = history[day.iso];
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
            {s && s.status === 'completed' && <FFBadge color="var(--accent-3)" bg="rgba(57,255,20,0.1)"><FFIcon name="check" size={12} /> Complétée</FFBadge>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {day.exercises.map((ex) => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 13px', background: 'var(--bg-2)', borderRadius: 13 }}>
              <div className="ff-placeholder" style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--txt-2)' }} className="ff-mono">GIF</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                <div className="ff-mono" style={{ fontSize: 11.5, color: 'var(--txt-1)', marginTop: 2 }}>
                  {ex.sets} × {ex.reps}{ex.target ? ` · ${ex.target} kg` : ''}
                </div>
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--txt-2)' }}>{ex.muscle}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--txt-2)', padding: '4px 2px' }} className="ff-mono">+ {day.cardio}</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…"
            aria-label="Note de séance"
            style={{ background: 'transparent', border: '1px dashed var(--line)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--txt-0)', outline: 'none' }} />
        </div>
        {(isToday || (day.date < TODAY && (!s || s.status === 'missed'))) && (
          <div style={{ padding: '10px 22px calc(18px + env(safe-area-inset-bottom))' }}>
            <NeonButton onClick={onStart}>DÉMARRER CETTE SÉANCE</NeonButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgramScreen({ onStartWorkout }: { onStartWorkout: () => void }) {
  const { weeks, history, TODAY, fmtISO, currentWeek } = FF;
  const [open, setOpen] = React.useState<Set<number>>(new Set([currentWeek]));
  const [selDay, setSelDay] = React.useState<Day | null>(null);
  const toggle = (n: number) => setOpen((o) => { const s = new Set(o); s.has(n) ? s.delete(n) : s.add(n); return s; });

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <header style={{ padding: '26px 20px 4px' }}>
        <h1 className="ff-display" style={{ fontSize: 28, fontWeight: 700 }}>Programme</h1>
        <p style={{ fontSize: 13, color: 'var(--txt-1)', marginTop: 6 }}>Carrure + Définition · 15 juin → 14 sept. 2026</p>
      </header>

      {/* phases */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 4px', overflowX: 'auto' }}>
        {FF.PHASES.map((p, i) => {
          const active = currentWeek >= p.weeks[0] && currentWeek <= p.weeks[1];
          return (
            <div key={p.id} className="ff-card" style={{ minWidth: 158, padding: 13, flexShrink: 0, borderColor: active ? 'rgba(0,240,255,0.3)' : 'var(--line)', boxShadow: active ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.08)' : 'none' }}>
              <div className="ff-label" style={{ fontSize: 9.5, color: active ? 'var(--accent)' : 'var(--txt-2)' }}>Phase {i + 1} · S{p.weeks[0]}-{p.weeks[1]}</div>
              <div className="ff-display" style={{ fontSize: 14, fontWeight: 600, marginTop: 5 }}>{p.name}</div>
              <div className="ff-mono" style={{ fontSize: 10.5, color: 'var(--txt-1)', marginTop: 4 }}>{p.rir}</div>
            </div>
          );
        })}
      </div>

      {/* timeline */}
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weeks.map((w) => {
          const isOpen = open.has(w.number);
          const isCurrent = w.number === currentWeek;
          const doneCount = w.days.filter((d) => history[d.iso] && history[d.iso].status === 'completed').length;
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
                    const s = history[d.iso];
                    const isToday = d.iso === fmtISO(TODAY);
                    const missed = s && s.status === 'missed';
                    const done = s && s.status === 'completed';
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
      {selDay && <DayDetail day={selDay} onClose={() => setSelDay(null)} onStart={() => { setSelDay(null); onStartWorkout(); }} />}
    </div>
  );
}
