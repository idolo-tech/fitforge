/* FitForge — Workout Player (séance en cours) */
import React from 'react';
import { FFIcon } from '../components/icons';
import { NeonButton, FFBadge, Stepper, RIRSelector, ExercisePlaceholder } from '../components/ui';
import { RestTimer } from './WorkoutExtras';
import * as FF from '../data/program';
import type { SessionSummary } from '../data/types';

export function fmtClock(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

interface LogEntry {
  exIdx: number;
  exName: string;
  set: number;
  weight: number | null;
  reps: number;
  rir: number;
}

// ---------- bouton de validation : swipe-up ou classique ----------
function ValidateControl({ gesture, onValidate }: { gesture: string; onValidate: () => void }) {
  const [drag, setDrag] = React.useState(0);
  const startY = React.useRef<number | null>(null);
  const MAX = 90;

  if (gesture === 'Bouton') {
    return (
      <NeonButton onClick={onValidate}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <FFIcon name="check" size={20} strokeWidth={2.6} /> VALIDER LA SÉRIE
        </span>
      </NeonButton>
    );
  }

  const begin = (y: number) => { startY.current = y; };
  const move = (y: number) => {
    if (startY.current == null) return;
    setDrag(Math.max(0, Math.min(MAX, startY.current - y)));
  };
  const end = () => {
    if (drag >= MAX * 0.8) { setDrag(0); startY.current = null; onValidate(); }
    else { setDrag(0); startY.current = null; }
  };
  const p = drag / MAX;

  return (
    <div style={{ position: 'relative', height: 56 }}>
      <div
        role="button" tabIndex={0} aria-label="Glisser vers le haut pour valider la série"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onValidate(); }}
        onTouchStart={(e) => begin(e.touches[0].clientY)}
        onTouchMove={(e) => move(e.touches[0].clientY)}
        onTouchEnd={end}
        onMouseDown={(e) => { begin(e.clientY); const mv = (ev: MouseEvent) => move(ev.clientY); const up = () => { end(); window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); }; window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up); }}
        className="ff-display"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, borderRadius: 14,
          transform: `translateY(${-drag}px)`,
          background: p > 0.78 ? 'var(--accent-3)' : 'var(--accent)',
          color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', cursor: 'grab', userSelect: 'none',
          boxShadow: `0 0 calc(${20 + p * 26}px * var(--glow)) rgba(${p > 0.78 ? '57,255,20' : '0,240,255'},${0.25 + p * 0.4})`,
          transition: startY.current == null ? 'transform var(--dur-med) cubic-bezier(0.22,1,0.36,1), background var(--dur-fast)' : 'background var(--dur-fast)',
          touchAction: 'none',
        }}>
        <FFIcon name="arrowUp" size={18} strokeWidth={2.6} />
        {p > 0.78 ? 'RELÂCHE !' : 'SWIPE POUR VALIDER'}
      </div>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: '1px dashed var(--line)', opacity: p > 0 ? 0.7 : 0, transition: 'opacity var(--dur-fast)' }}></div>
    </div>
  );
}

// ---------- player principal ----------
interface WorkoutPlayerProps {
  gesture: string;
  timerDesign: string;
  desktop?: boolean;
  onFinish: (s: SessionSummary) => void;
  onQuit: () => void;
}
export function WorkoutPlayer({ gesture, timerDesign, desktop = false, onFinish, onQuit }: WorkoutPlayerProps) {
  const pane = desktop ? { width: '100%', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' } : undefined;
  const day = FF.todayDay!;
  const exercises = day.exercises;

  const [exIdx, setExIdx] = React.useState(0);
  const [setNum, setSetNum] = React.useState(1);
  const [logs, setLogs] = React.useState<LogEntry[]>([]); // {exIdx, set, weight, reps, rir}
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [resting, setResting] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const [chromeVisible, setChromeVisible] = React.useState(true);
  const [logsOpen, setLogsOpen] = React.useState(false);

  const ex = exercises[exIdx];
  const isWeighted = ex.target != null;
  const range = FF.repsRange(ex.reps);
  const smartStep = isWeighted && ex.target! >= 40 ? 2.5 : 1;

  const [weight, setWeight] = React.useState(ex.target || 0);
  const [reps, setReps] = React.useState(range ? range[0] : 10);
  const [rir, setRir] = React.useState(2);

  // timer global
  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  // chrome auto-hide après 3.5s
  React.useEffect(() => {
    if (!chromeVisible) return;
    const t = setTimeout(() => setChromeVisible(false), 3500);
    return () => clearTimeout(t);
  }, [chromeVisible, exIdx, setNum]);

  // reset inputs au changement d'exercice
  React.useEffect(() => {
    const e2 = exercises[exIdx];
    setWeight(e2.target || 0);
    const r2 = FF.repsRange(e2.reps);
    setReps(r2 ? r2[0] : 10);
    setRir(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIdx]);

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = logs.length;
  const isLastSetOfExercise = setNum >= ex.sets;
  const isLastExercise = exIdx >= exercises.length - 1;
  const sessionDone = isLastExercise && isLastSetOfExercise && doneSets >= totalSets - 1;

  const validate = () => {
    setLogs((l) => [...l, { exIdx, exName: ex.name, set: setNum, weight: isWeighted ? weight : null, reps, rir }]);
    setFlash(true);
    setTimeout(() => setFlash(false), 160);
    if (isLastSetOfExercise && isLastExercise) {
      finish();
      return;
    }
    setResting(true);
  };

  const advance = () => {
    setResting(false);
    if (isLastSetOfExercise) { setExIdx(exIdx + 1); setSetNum(1); }
    else setSetNum(setNum + 1);
  };

  const finish = () => {
    const allLogs = [...logs, { exIdx, exName: ex.name, set: setNum, weight: isWeighted ? weight : null, reps, rir }];
    const volume = allLogs.reduce((a, l) => a + (l.weight ? l.weight * l.reps : 0), 0);
    const intensity = allLogs.filter((_, i) => i % 2 === 0).map((l) => 4 - l.rir);
    onFinish({
      dayName: day.name,
      volume: Math.round(volume),
      duration: fmtClock(elapsed),
      prCount: allLogs.some((l) => l.weight && l.weight > (exercises[l.exIdx].target || 0)) ? 1 : 1,
      kcal: Math.round(220 + elapsed * 0.09),
      intensity: intensity.length >= 2 ? intensity : [1, 2, 2, 3],
      comparison: [
        { label: 'Volume total', value: '+420 kg', delta: 1 },
        { label: 'Squat guidé', value: '+2,5 kg', delta: 1 },
        { label: 'Durée', value: '-4 min', delta: 1 },
      ],
    });
  };

  const rirColor = (r: number) => (r <= 0 ? '#FF9F43' : r <= 2 ? '#39FF14' : '#4A4A4A');

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', alignItems: desktop ? 'center' : undefined, overflow: 'hidden' }}
      onClick={() => !chromeVisible && setChromeVisible(true)}>

      {/* progress bar 1px */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--bg-2)', zIndex: 5 }}>
        <div style={{ height: '100%', width: `${(doneSets / totalSets) * 100}%`, background: 'var(--accent)', boxShadow: '0 0 calc(8px * var(--glow)) rgba(0,240,255,0.7)', transition: 'width var(--dur-med) ease' }}></div>
      </div>

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 8px',
        opacity: chromeVisible ? 1 : 0, transition: 'opacity var(--dur-med) ease', zIndex: 5,
        pointerEvents: chromeVisible ? 'auto' : 'none', ...pane,
      }}>
        <button className="pressable" onClick={onQuit} aria-label="Quitter la séance"
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)' }}>
          <FFIcon name="close" size={17} />
        </button>
        <span className="ff-mono" style={{ fontSize: 17, fontWeight: 600, color: paused ? 'var(--txt-2)' : 'var(--txt-0)', letterSpacing: '0.06em' }}>
          {fmtClock(elapsed)}{paused ? ' ⏸' : ''}
        </span>
        <button className="pressable" onClick={() => setPaused(!paused)} aria-label={paused ? 'Reprendre' : 'Pause'}
          style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-1)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: paused ? 'var(--accent)' : 'var(--txt-1)' }}>
          <FFIcon name={paused ? 'play' : 'pause'} size={17} />
        </button>
      </div>

      {/* séries complétées (mini-liste) */}
      {logs.length > 0 && (
        <div style={{ padding: '0 18px', zIndex: 5, ...pane }}>
          <button onClick={() => setLogsOpen(!logsOpen)} className="ff-label" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', color: 'var(--txt-2)' }}>
            {logs.length} série{logs.length > 1 ? 's' : ''} validée{logs.length > 1 ? 's' : ''}
            <FFIcon name="chevronD" size={12} style={{ transform: logsOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }} />
          </button>
          {logsOpen && (
            <div className="anim-fade-in" style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 6 }}>
              {[...logs].reverse().map((l, i) => (
                <span key={i} className="ff-mono" style={{ fontSize: 11.5, color: rirColor(l.rir) }}>
                  S{l.set} · {l.exName.slice(0, 22)} : {l.weight ? `${l.weight}kg × ` : ''}{l.reps} @ RIR {l.rir}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* zone exercice */}
      <div key={exIdx} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', animation: 'ff-slide-ex var(--dur-med) cubic-bezier(0.22,1,0.36,1) both', ...pane }}>
        <ExercisePlaceholder label={`démo — ${ex.name.toLowerCase()}`} height="100%" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.35) 35%, rgba(5,5,5,0.96) 75%)' }}></div>

        <div style={{ position: 'relative', padding: '0 22px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ff-mono text-glow-cyan" style={{ fontSize: 60, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.01em' }}>
            SÉRIE {setNum}<span style={{ color: 'var(--txt-2)', fontSize: 34 }}>/{ex.sets}</span>
          </div>
          <h1 className="ff-display" style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.1 }}>{ex.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <FFBadge>{ex.muscle}</FFBadge>
            <FFBadge>Cible : {ex.reps}{isWeighted ? ` × ${ex.target} kg` : ''}</FFBadge>
            <span style={{ fontSize: 11.5, color: 'var(--txt-2)' }}>{ex.note}</span>
          </div>
        </div>
      </div>

      {/* zone thumb : inputs + validation */}
      <div style={{ padding: '14px 20px calc(20px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-0)', borderTop: '1px solid var(--line)', ...pane }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isWeighted && (
            <>
              <Stepper label="Poids" value={weight} onChange={setWeight} step={smartStep} unit="kg" format={(v) => (v % 1 ? v.toFixed(1) : v)} />
              <span style={{ color: 'var(--txt-2)', fontSize: 17, paddingTop: 18 }} className="ff-mono">×</span>
            </>
          )}
          <Stepper label="Reps" value={reps} onChange={setReps} step={1} min={1} />
        </div>
        <RIRSelector value={rir} onChange={setRir} />
        {sessionDone || (isLastExercise && isLastSetOfExercise) ? (
          <NeonButton color="var(--accent-3)" onClick={validate}>TERMINER LA SÉANCE</NeonButton>
        ) : (
          <ValidateControl gesture={gesture} onValidate={validate} />
        )}
      </div>

      {/* flash blanc */}
      {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 48, animation: 'ff-flash 0.16s ease-out forwards', pointerEvents: 'none' }}></div>}

      {/* repos */}
      {resting && (
        <RestTimer total={ex.rest} design={timerDesign} exerciseName={ex.name} onDone={advance} onSkip={advance} />
      )}
    </div>
  );
}
