/* FitForge — feuille de progression d'un exercice (1RM estimé + historique) */
import { FFIcon } from './icons';
import { Sparkline } from './ui';
import { useStore, exerciseProgress } from '../data/store';

export function ExerciseProgress({ exId, name, onClose }: { exId: string; name: string; onClose: () => void }) {
  const data = useStore();
  const points = exerciseProgress(data, exId);
  const weighted = points.some((p) => p.est1RM > 0);
  const series = (weighted ? points.map((p) => p.est1RM) : points.map((p) => p.topReps)).filter((v) => v > 0);
  const last = series[series.length - 1] ?? 0;
  const best = series.length ? Math.max(...series) : 0;
  const first = series[0] ?? 0;
  const delta = series.length >= 2 ? +(last - first).toFixed(1) : null;
  const unit = weighted ? 'kg' : 'reps';

  return (
    <div className="anim-fade-in" style={{ position: 'absolute', inset: 0, zIndex: 36, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div className="anim-fade-up" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '86%', background: 'var(--bg-1)', borderRadius: '24px 24px 0 0',
        border: '1px solid var(--line)', borderBottom: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--bg-2)', margin: '12px auto 0' }} />
        <div style={{ padding: '14px 22px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="ff-label" style={{ color: 'var(--accent)' }}>Progression</div>
            <h2 className="ff-display" style={{ fontSize: 21, fontWeight: 700, marginTop: 6 }}>{name}</h2>
          </div>
          <button className="pressable" onClick={onClose} aria-label="Fermer"
            style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)', flexShrink: 0 }}>
            <FFIcon name="close" size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {points.length === 0 ? (
            <div style={{ padding: '30px 8px', textAlign: 'center', color: 'var(--txt-2)', fontSize: 13, lineHeight: 1.5 }}>
              Aucune donnée pour l'instant.<br />Fais cet exercice pour suivre ta progression.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="ff-card" style={{ flex: 1, padding: 14 }}>
                  <span className="ff-label" style={{ fontSize: 9.5 }}>{weighted ? '1RM estimé' : 'Reps max'}</span>
                  <div className="ff-mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{last || '—'}<span style={{ fontSize: 12, color: 'var(--txt-1)' }}> {unit}</span></div>
                  {delta != null && <span style={{ fontSize: 11, color: delta >= 0 ? 'var(--accent-3)' : 'var(--accent-2)' }}>{delta >= 0 ? '▲ +' : '▼ '}{delta} {unit} depuis le début</span>}
                </div>
                <div className="ff-card" style={{ flex: 1, padding: 14 }}>
                  <span className="ff-label" style={{ fontSize: 9.5 }}>Record</span>
                  <div className="ff-mono" style={{ fontSize: 26, fontWeight: 700 }}>{best || '—'}<span style={{ fontSize: 12, color: 'var(--txt-1)' }}> {unit}</span></div>
                  {weighted && <span style={{ fontSize: 11, color: 'var(--txt-2)' }}>charge max {Math.max(...points.map((p) => p.topWeight))} kg</span>}
                </div>
              </div>

              {series.length >= 2 ? (
                <div className="ff-card" style={{ padding: '16px 14px' }}>
                  <div className="ff-label" style={{ fontSize: 9.5, marginBottom: 10 }}>{weighted ? '1RM estimé · par séance' : 'Reps · par séance'}</div>
                  <Sparkline points={series} width={300} height={70} />
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--txt-2)', textAlign: 'center', padding: '6px 0' }}>Logue au moins 2 séances pour voir la courbe.</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ff-label" style={{ fontSize: 9.5 }}>Séances</span>
                {[...points].reverse().slice(0, 12).map((p) => (
                  <div key={p.iso} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-2)' }}>
                    <span className="ff-mono" style={{ fontSize: 11.5, color: 'var(--txt-2)' }}>S{p.week} · {p.iso.slice(5)}</span>
                    <span className="ff-mono" style={{ fontSize: 12.5, color: 'var(--txt-0)' }}>
                      {weighted ? `${p.topWeight} kg · 1RM ${p.est1RM}` : `${p.topReps} reps`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
