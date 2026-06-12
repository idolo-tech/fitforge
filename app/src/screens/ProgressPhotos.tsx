/* FitForge — photos de progression : upload + galerie par date (Convex File Storage).
   Rendu uniquement quand Convex/Auth est actif (utilise des hooks Convex). */
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FFIcon } from '../components/icons';
import { TODAY, fmtISO, fmtShort } from '../data/program';

const ANGLES = [
  { key: 'face', label: 'Face' },
  { key: 'left', label: 'Profil G' },
  { key: 'right', label: 'Profil D' },
  { key: 'back', label: 'Dos' },
];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return fmtShort(new Date(y, m - 1, d));
}

export function ProgressPhotos({ desktop = false }: { desktop?: boolean }) {
  const photos = useQuery(api.photos.list);
  const genUrl = useMutation(api.photos.generateUploadUrl);
  const save = useMutation(api.photos.save);
  const removePhoto = useMutation(api.photos.remove);

  const todayIso = fmtISO(TODAY);
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [sel, setSel] = React.useState(todayIso);
  const inputs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const list = photos ?? [];
  const dates = React.useMemo(() => {
    const ds = [...new Set(list.map((p) => p.date))].sort().reverse();
    return ds.includes(todayIso) ? ds : [todayIso, ...ds];
  }, [list, todayIso]);
  const selDate = dates.includes(sel) ? sel : dates[0] ?? todayIso;
  const isToday = selDate === todayIso;

  const photoFor = (angle: string) => list.find((p) => p.date === selDate && p.angle === angle) ?? null;

  async function onFile(angle: string, file: File | undefined) {
    if (!file) return;
    setUploading(angle);
    try {
      const url = await genUrl();
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const { storageId } = await res.json();
      await save({ storageId, angle, date: todayIso });
      setSel(todayIso);
    } catch { /* ignore */ } finally {
      setUploading(null);
      const el = inputs.current[angle];
      if (el) el.value = '';
    }
  }

  const taken = ANGLES.filter((a) => photoFor(a.key)).length;

  return (
    <section style={{ margin: desktop ? '24px 0 0' : '24px 20px 0' }} aria-label="Photos de progression">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="ff-label">Photos de progression</span>
        <span className="ff-mono" style={{ fontSize: 11, color: 'var(--txt-2)' }}>
          {taken}/4 · {isToday ? "aujourd'hui" : fmtDate(selDate)}
        </span>
      </div>

      {dates.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 4 }} aria-label="Dates">
          {dates.map((d) => {
            const active = d === selDate;
            return (
              <button key={d} className="pressable" onClick={() => setSel(d)} style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                background: active ? 'rgba(0,240,255,0.08)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--txt-1)', whiteSpace: 'nowrap',
              }}>{d === todayIso ? "Aujourd'hui" : fmtDate(d)}</button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {ANGLES.map((a) => {
          const p = photoFor(a.key);
          const busy = uploading === a.key;
          return (
            <div key={a.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="ff-placeholder" style={{ aspectRatio: '3/4', borderRadius: 10, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p && p.url ? (
                  <>
                    <img src={p.url} alt={`${a.label} — ${fmtDate(selDate)}`} loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button className="pressable" aria-label={`Supprimer la photo ${a.label}`} onClick={() => removePhoto({ id: p.id })}
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(5,5,5,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-0)' }}>
                      <FFIcon name="close" size={12} strokeWidth={2.4} />
                    </button>
                  </>
                ) : isToday ? (
                  <button className="pressable" aria-label={`Ajouter une photo ${a.label}`} disabled={busy}
                    onClick={() => inputs.current[a.key]?.click()}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: busy ? 'var(--accent)' : 'var(--txt-2)' }}>
                    <FFIcon name={busy ? 'timer' : 'camera'} size={18} />
                  </button>
                ) : (
                  <span className="ff-mono" style={{ fontSize: 18, color: 'var(--txt-2)' }}>—</span>
                )}
                <input ref={(el) => { inputs.current[a.key] = el; }} type="file" accept="image/*" capture="environment"
                  onChange={(e) => onFile(a.key, e.target.files?.[0])} style={{ display: 'none' }} />
              </div>
              <span className="ff-label" style={{ fontSize: 9, textAlign: 'center' }}>{a.label}</span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--txt-2)', marginTop: 8 }}>
        {isToday ? 'Capture tes 4 angles, puis compare au fil des semaines.' : 'Reviens sur « Aujourd’hui » pour ajouter de nouvelles photos.'}
      </p>
    </section>
  );
}
