/* FitForge — Coach IA : affiche le dernier rapport (auto ou manuel) + bouton on-demand.
   L'adaptation se déclenche automatiquement après chaque séance (cf. AuthGate). */
import React from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FFIcon } from '../components/icons';
import { NeonButton } from '../components/ui';
import { WEIGHTED_EXERCISES } from '../data/program';

const NAME: Record<string, string> = Object.fromEntries(WEIGHTED_EXERCISES.map((e) => [e.exId, e.name]));

function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export function CoachPanel({ desktop = false }: { desktop?: boolean }) {
  const report = useQuery(api.coach.latestReport);
  const adapt = useAction(api.ai.adaptProgram);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      await adapt({ catalog: WEIGHTED_EXERCISES });
    } catch {
      setError("L'adaptation a échoué (clé IA / quota / réseau). Réessaie.");
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
          <div style={{ fontSize: 11.5, color: 'var(--txt-1)' }}>S'adapte automatiquement après chaque séance</div>
        </div>
      </div>

      <NeonButton onClick={run} disabled={loading}>
        {loading ? 'ANALYSE…' : 'ADAPTER MAINTENANT'}
      </NeonButton>

      {error && <div role="alert" style={{ fontSize: 12, color: 'var(--accent-2)', lineHeight: 1.4 }}>{error}</div>}

      {report === null && !loading && (
        <span style={{ fontSize: 12, color: 'var(--txt-2)' }}>Pas encore d'analyse. Termine une séance (ou clique ci-dessus) pour la première adaptation.</span>
      )}

      {report && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span className="ff-label">Dernière analyse</span>
            <span className="ff-mono" style={{ fontSize: 10.5, color: 'var(--txt-2)' }}>{ago(report._creationTime)}</span>
          </div>
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
            <span style={{ fontSize: 12, color: 'var(--txt-2)' }}>Aucun changement à la dernière analyse — continue comme ça.</span>
          )}
        </div>
      )}
    </section>
  );
}
