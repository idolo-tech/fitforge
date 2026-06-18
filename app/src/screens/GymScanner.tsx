/* FitForge — Scanner de salle : photo d'une/des machine(s) → l'IA (vision) identifie
   les machines et les relie à tes exercices. Historique « ma salle ». Mode connecté. */
import React from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FFIcon } from '../components/icons';
import { FFBadge } from '../components/ui';
import * as FF from '../data/program';
import { lastWeight, prescribedWeight } from '../data/store';

const NAME: Record<string, string> = Object.fromEntries(FF.WEIGHTED_EXERCISES.map((e) => [e.exId, e.name]));

interface ScanExercise { exId?: string; name: string; howTo: string; setsReps?: string; }
interface ScanMachine { name: string; confidence: number; muscles: string[]; exercises: ScanExercise[]; }
interface ScanResult { id: string; summary: string; machines: ScanMachine[] }

/** Réduit la photo (max 1024px, JPEG) avant upload pour limiter coût/latence. */
async function prepImage(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
    if (scale >= 1) return file;
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

function confColor(c: number): string {
  return c >= 0.7 ? 'var(--accent-3)' : c >= 0.4 ? '#FF9F43' : 'var(--accent-2)';
}

function MachineCard({ m }: { m: ScanMachine }) {
  return (
    <div className="ff-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <FFIcon name="dumbbell" size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span className="ff-display" style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
        </div>
        <span className="ff-mono" style={{ fontSize: 11, color: confColor(m.confidence), flexShrink: 0 }}>{Math.round(m.confidence * 100)}%</span>
      </div>

      {m.muscles.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {m.muscles.map((mu, i) => <FFBadge key={i}>{mu}</FFBadge>)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {m.exercises.map((ex, i) => {
          const inProgram = !!ex.exId && NAME[ex.exId] != null;
          const last = ex.exId ? lastWeight(ex.exId) : null;
          const presc = ex.exId ? prescribedWeight(ex.exId) : null;
          const demoName = ex.exId ? (NAME[ex.exId] ?? ex.name) : ex.name;
          return (
            <div key={i} style={{ padding: '11px 12px', borderRadius: 12, background: 'var(--bg-2)', border: inProgram ? '1px solid rgba(0,240,255,0.25)' : '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{ex.name}</span>
                {ex.setsReps && <span className="ff-mono" style={{ fontSize: 11.5, color: 'var(--accent)', flexShrink: 0 }}>{ex.setsReps}</span>}
              </div>
              <span style={{ fontSize: 12, color: 'var(--txt-1)', lineHeight: 1.5 }}>{ex.howTo}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 }}>
                {inProgram && <FFBadge color="#000" bg="var(--accent)" style={{ fontWeight: 700 }}>De ton programme</FFBadge>}
                {presc != null && <FFBadge color="#000" bg="var(--accent)">Coach · {presc} kg</FFBadge>}
                {presc == null && last != null && <FFBadge>Dernière : {last} kg</FFBadge>}
                <a href={FF.exerciseDemoUrl(demoName)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, border: '1px solid rgba(0,240,255,0.35)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                  <FFIcon name="play" size={11} /> Démo
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GymScanner({ onClose, desktop = false }: { onClose: () => void; desktop?: boolean }) {
  const genUrl = useMutation(api.photos.generateUploadUrl);
  const analyze = useAction(api.ai.analyzeGymPhoto);
  const scans = useQuery(api.gym.list);
  const removeScan = useMutation(api.gym.remove);

  const [busy, setBusy] = React.useState<null | 'upload' | 'analyze'>(null);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setError(null); setResult(null); setBusy('upload');
    try {
      const img = await prepImage(file);
      const url = await genUrl();
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': img.type || 'image/jpeg' }, body: img });
      const { storageId } = await res.json();
      setBusy('analyze');
      const r = await analyze({ storageId, catalog: FF.WEIGHTED_EXERCISES });
      setResult(r as ScanResult);
    } catch {
      setError("L'analyse a échoué (IA / quota / réseau). Réessaie avec une photo nette et bien cadrée.");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const pane = desktop ? { maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' } : undefined;
  const machines = result?.machines ?? [];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 38, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 10px', ...pane }}>
        <div>
          <div className="ff-label" style={{ color: 'var(--accent)' }}>Vision IA</div>
          <h1 className="ff-display" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Scanner ma salle</h1>
        </div>
        <button className="pressable" onClick={onClose} aria-label="Fermer"
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)' }}>
          <FFIcon name="close" size={17} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px calc(24px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 16, ...pane }}>
        {!result && (
          <button className="pressable" onClick={() => inputRef.current?.click()} disabled={!!busy}
            style={{ borderRadius: 18, border: '1.5px dashed rgba(0,240,255,0.4)', background: 'rgba(0,240,255,0.04)', padding: '34px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--accent)' }}>
            <FFIcon name={busy ? 'timer' : 'camera'} size={34} />
            <span className="ff-display" style={{ fontSize: 16, fontWeight: 700 }}>
              {busy === 'upload' ? 'Envoi de la photo…' : busy === 'analyze' ? 'Analyse en cours…' : 'Photographier une machine'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--txt-1)', textAlign: 'center', lineHeight: 1.5, maxWidth: 320 }}>
              Une machine en gros plan, ou une vue large de la salle. L'IA te dira quels exercices de ton programme tu peux y faire.
            </span>
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/*" capture="environment"
          onChange={(e) => onFile(e.target.files?.[0])} style={{ display: 'none' }} />

        {error && <div role="alert" style={{ fontSize: 12.5, color: 'var(--accent-2)', lineHeight: 1.4 }}>{error}</div>}

        {result && (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--txt-1)', lineHeight: 1.5 }}>{result.summary}</p>
              <button className="pressable ff-label" onClick={() => { setResult(null); inputRef.current?.click(); }}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,240,255,0.35)', color: 'var(--accent)', fontSize: 11 }}>
                <FFIcon name="camera" size={13} /> Reprendre
              </button>
            </div>
            {machines.length === 0 ? (
              <div className="ff-card" style={{ padding: 20, textAlign: 'center', color: 'var(--txt-2)', fontSize: 13, lineHeight: 1.5 }}>
                Aucune machine reconnue sur cette photo.<br />Rapproche-toi et cadre bien la machine.
              </div>
            ) : machines.map((m, i) => <MachineCard key={i} m={m} />)}
          </div>
        )}

        {/* historique « ma salle » */}
        {scans && scans.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            <span className="ff-label">Ma salle · scans récents</span>
            {scans.map((s) => (
              <div key={s.id} className="ff-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10 }}>
                <button className="pressable" onClick={() => { setResult({ id: s.id, summary: s.summary, machines: s.machines as ScanMachine[] }); setError(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div className="ff-placeholder" style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                    {s.url && <img src={s.url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.machines.map((m) => m.name).slice(0, 3).join(', ') || 'Scan'}
                    </div>
                    <div className="ff-mono" style={{ fontSize: 10.5, color: 'var(--txt-2)' }}>{s.machines.length} machine{s.machines.length > 1 ? 's' : ''} · {s.createdAt.slice(0, 10)}</div>
                  </div>
                </button>
                <button className="pressable" onClick={() => { void removeScan({ id: s.id }); if (result?.id === s.id) setResult(null); }} aria-label="Supprimer le scan"
                  style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-2)', flexShrink: 0 }}>
                  <FFIcon name="close" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
