/* FitForge — Coach IA : déclenche l'adaptation du programme (action Convex + AI SDK).
   Rendu uniquement quand Convex/Auth est actif. */
import React from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FFIcon } from '../components/icons';
import { NeonButton } from '../components/ui';
import { WEIGHTED_EXERCISES } from '../data/program';

interface Adjustment { exId: string; targetWeight: number; reason: string; }
interface Report { summary: string; adjustments: Adjustment[]; alerts: string[]; }

const NAME: Record<string, string> = Object.fromEntries(WEIGHTED_EXERCISES.map((e) => [e.exId, e.name]));

export function CoachPanel({ desktop = false }: { desktop?: boolean }) {
  const adapt = useAction(api.ai.adaptProgram);
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await adapt({ catalog: WEIGHTED_EXERCISES });
      setReport(r as Report);
    } catch {
      setError("L'adaptation a échoué (clé IA absente / quota / réseau). Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ff-card" style={{ margin: desktop ? '24px 0 0' : '24px 20px 0', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Coach IA">
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FFIcon name="flame" size={18} color="var(--accent)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ff-display" style={{ fontSize: 15, fontWeight: 700 }}>Coach IA</div>
          <div style={{ fontSize: 11.5, color: 'var(--txt-1)' }}>Ajuste tes poids selon ta progression et tes notes</div>
        </div>
      </div>

      <NeonButton onClick={run} disabled={loading}>
        {loading ? 'ANALYSE…' : 'ADAPTER MON PROGRAMME'}
      </NeonButton>

      {error && <div role="alert" style={{ fontSize: 12, color: 'var(--accent-2)', lineHeight: 1.4 }}>{error}</div>}

      {report && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--txt-0)', lineHeight: 1.5 }}>{report.summary}</p>

          {report.alerts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 10, background: 'rgba(255,61,113,0.06)', border: '1px solid rgba(255,61,113,0.25)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', flexShrink: 0, marginTop: 5 }} />
                  <span style={{ fontSize: 12, color: 'var(--txt-0)', lineHeight: 1.45 }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {report.adjustments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="ff-label">Ajustements appliqués</span>
              {report.adjustments.map((a) => (
                <div key={a.exId} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{NAME[a.exId] ?? a.exId}</span>
                    <span className="ff-mono" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{a.targetWeight} kg</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--txt-1)', lineHeight: 1.45 }}>{a.reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--txt-2)' }}>Aucun changement proposé — continue comme ça. Logue plus de séances pour affiner.</span>
          )}
        </div>
      )}
    </section>
  );
}
