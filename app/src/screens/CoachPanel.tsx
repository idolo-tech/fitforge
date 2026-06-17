/* FitForge — Coach IA : affiche le dernier rapport (auto ou manuel) + bouton on-demand.
   L'adaptation se déclenche automatiquement après chaque séance (cf. AuthGate). */
import React from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FFIcon } from '../components/icons';
import { NeonButton } from '../components/ui';
import { WEIGHTED_EXERCISES } from '../data/program';
import { getData, scheduleContext } from '../data/store';

const NAME: Record<string, string> = Object.fromEntries(WEIGHTED_EXERCISES.map((e) => [e.exId, e.name]));

function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function CoachChat() {
  const chat = useAction(api.ai.chatCoach);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await chat({ messages: next, catalog: WEIGHTED_EXERCISES, schedule: scheduleContext(getData()) });
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Désolé, je n'ai pas pu répondre (IA / quota / réseau). Réessaie." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button className="pressable ff-label" onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(0,240,255,0.05)', color: 'var(--accent)', fontSize: 12, alignSelf: 'flex-start' }}>
        <FFIcon name="flame" size={13} /> Discuter avec le coach
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ff-label">Discuter avec le coach</span>
        <button className="pressable" onClick={() => setOpen(false)} aria-label="Fermer le chat" style={{ color: 'var(--txt-2)', fontSize: 13, width: 22, height: 22 }}>✕</button>
      </div>
      <div ref={scrollRef} style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--txt-2)', lineHeight: 1.5 }}>
            Pose une question : « Comment progresser au développé incliné ? », « Par quoi remplacer les fentes ? », « Combien de protéines aujourd'hui ? »
          </span>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '9px 12px', borderRadius: 12,
            fontSize: 12.5, lineHeight: 1.5, whiteSpace: 'pre-wrap',
            background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-2)', color: m.role === 'user' ? '#000' : 'var(--txt-0)',
            border: m.role === 'user' ? 'none' : '1px solid var(--line)',
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--txt-2)', padding: '2px' }}>Le coach réfléchit…</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Ta question…" aria-label="Message au coach"
          style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--txt-0)', outline: 'none' }} />
        <button className="pressable" onClick={send} disabled={loading || !input.trim()} aria-label="Envoyer"
          style={{ width: 44, borderRadius: 10, background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-2)', color: input.trim() && !loading ? '#000' : 'var(--txt-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FFIcon name="arrowUp" size={18} />
        </button>
      </div>
    </div>
  );
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
      await adapt({ catalog: WEIGHTED_EXERCISES, schedule: scheduleContext(getData()) });
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

      <CoachChat />
    </section>
  );
}
