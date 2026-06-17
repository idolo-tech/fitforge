/* FitForge — Dashboard (données réelles) */
import { FFIcon } from '../components/icons';
import { NeonButton, FFBadge, Sparkline, ConsistencyHeatmap, ExercisePlaceholder } from '../components/ui';
import * as FF from '../data/program';
import { useStore, actionableDay, streak, weeklyVolume, completedCount, missedDays, catchUpPlan } from '../data/store';
import type { Day } from '../data/types';
import type { StoreData } from '../data/store';

function DashHeader({ name, data, desktop = false }: { name: string; data: StoreData; desktop?: boolean }) {
  const { TODAY, fmtLong, programStarted, currentWeek } = FF;
  const st = streak(data);
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: desktop ? '10px 0 6px' : '22px 20px 6px' }}>
      <div className="ff-display" style={{
        width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-2)', border: '1px solid var(--line)', fontSize: 15, fontWeight: 700, color: 'var(--accent)',
        boxShadow: '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.18)',
      }}>{name.slice(0, 2).toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ff-display" style={{ fontSize: 18, fontWeight: 700 }}>{name}</span>
          {st > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--accent-2)', fontSize: 13, fontWeight: 700 }} className="ff-mono">
              <span style={{ display: 'inline-block', animation: st > 3 ? 'ff-flame calc(1.4s * var(--speed)) ease-in-out infinite' : 'none' }}>
                <FFIcon name="flame" size={15} color="var(--accent-2)" strokeWidth={2} />
              </span>
              {st}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--txt-1)', textTransform: 'capitalize' }}>
          {fmtLong(TODAY)}{programStarted ? ` · Semaine ${currentWeek}` : ''}
        </div>
      </div>
    </header>
  );
}

/* ---------- hero « séance » : gère à venir / aujourd'hui / prochaine / terminé ---------- */
function HeroSeance({ layout, data, onStart, desktop = false }: { layout: string; data: StoreData; onStart: (d: Day) => void; desktop?: boolean }) {
  const act = actionableDay(data);
  const day = act.day;
  const nEx = day.exercises.length;
  const heroImages = day.exercises.find((e) => e.images && e.images.length)?.images;
  const m = desktop ? { margin: 0 } : undefined;

  const label =
    act.status === 'upcoming' ? `Première séance · ${FF.fmtLong(FF.PROGRAM_START)}`.replace(/^(.)/, (c) => c.toUpperCase())
    : act.status === 'today' ? 'Séance du jour'
    : act.status === 'next' ? `Prochaine séance · ${FF.fmtLong(day.date)}`
    : 'Programme terminé';
  const sub =
    act.status === 'upcoming' ? (FF.daysUntilStart === 0 ? 'C’est parti aujourd’hui' : `Démarre dans ${FF.daysUntilStart} jour${FF.daysUntilStart > 1 ? 's' : ''}`)
    : null;

  if (act.status === 'finished') {
    return (
      <section className="ff-card anim-fade-up" style={{ margin: desktop ? 0 : '14px 20px 0', padding: 24, textAlign: 'center', ...m }}>
        <div className="ff-display" style={{ fontSize: 24, fontWeight: 700 }}>12 semaines bouclées 🎉</div>
        <p style={{ fontSize: 13, color: 'var(--txt-1)', marginTop: 8 }}>Tu as terminé le programme. Refais une séance quand tu veux depuis l’onglet Programme.</p>
      </section>
    );
  }

  const Meta = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {sub && <FFBadge color="var(--accent)" bg="rgba(0,240,255,0.08)">{sub}</FFBadge>}
      <FFBadge bg="rgba(26,26,26,0.85)"><FFIcon name="dumbbell" size={13} /> {nEx} exercices</FFBadge>
      <FFBadge bg="rgba(26,26,26,0.85)">{day.location}</FFBadge>
    </div>
  );

  if (layout === 'Compact') {
    return (
      <section className="ff-card anim-fade-up" style={{ margin: '14px 20px 0', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, ...m }} aria-label="Séance">
        <div className="ff-label" style={{ color: 'var(--accent)' }}>{label}</div>
        <h2 className="ff-display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{day.name}</h2>
        <Meta />
        <NeonButton pulse={act.status === 'today'} onClick={() => onStart(day)}>DÉMARRER</NeonButton>
      </section>
    );
  }

  if (layout === 'Split') {
    return (
      <section className="ff-card anim-fade-up" style={{ margin: '14px 20px 0', overflow: 'hidden', display: 'grid', gridTemplateColumns: '104px 1fr', ...m }} aria-label="Séance">
        <ExercisePlaceholder label="visuel" images={heroImages} height="100%" style={{ borderRight: '1px solid var(--line)' }} />
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ff-label" style={{ color: 'var(--accent)' }}>{label}</div>
          <h2 className="ff-display" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.12 }}>{day.name}</h2>
          <Meta />
          <NeonButton pulse={act.status === 'today'} onClick={() => onStart(day)} style={{ height: 48, fontSize: 15 }}>DÉMARRER</NeonButton>
        </div>
      </section>
    );
  }

  // Immersif (défaut)
  return (
    <section className="anim-fade-up" style={{ margin: desktop ? 0 : '14px 20px 0', borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', border: '1px solid var(--line)', ...m }} aria-label="Séance">
      <ExercisePlaceholder label={`séance — ${day.short.toLowerCase()}`} images={heroImages} height={desktop ? 360 : 290} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.1) 20%, rgba(5,5,5,0.92) 78%)' }}></div>
      <div style={{ position: 'absolute', inset: 0, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
        <div className="ff-label" style={{ color: 'var(--accent)' }}>{label}</div>
        <h2 className="ff-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.08 }}>{day.name}</h2>
        <Meta />
        <NeonButton pulse={act.status === 'today'} onClick={() => onStart(day)}>DÉMARRER</NeonButton>
      </div>
    </section>
  );
}

/* ---------- séances manquées à rattraper ---------- */
function CatchUpCard({ data, onStart, desktop = false }: { data: StoreData; onStart: (d: Day) => void; desktop?: boolean }) {
  const missed = missedDays(data);
  if (missed.length === 0) return null;
  const list = missed.slice(-3); // jusqu'à 3 manques récents (ordre chronologique)
  const rest = missed.length - list.length;
  const forecast = catchUpPlan(data).slice(0, 3); // calendrier réadapté (prochaines séances décalées)
  return (
    <section className="ff-card anim-fade-up" aria-label="Séances à rattraper"
      style={{ margin: desktop ? 0 : '14px 20px 0', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, borderColor: 'rgba(255,61,113,0.3)', boxShadow: '0 0 calc(16px * var(--glow)) rgba(255,61,113,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FFIcon name="close" size={13} color="var(--accent-2)" strokeWidth={2.4} />
        <span className="ff-label" style={{ color: 'var(--accent-2)' }}>{missed.length} séance{missed.length > 1 ? 's' : ''} à rattraper</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((d) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.short}</div>
              <div className="ff-mono" style={{ fontSize: 11, color: 'var(--txt-2)', textTransform: 'capitalize' }}>{FF.fmtLong(d.date)} · {d.exercises.length} exos</div>
            </div>
            <button className="pressable ff-display" onClick={() => onStart(d)} aria-label={`Rattraper : ${d.name}`}
              style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,61,113,0.1)', border: '1px solid rgba(255,61,113,0.35)', color: 'var(--accent-2)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
              RATTRAPER
            </button>
          </div>
        ))}
      </div>
      {rest > 0 && <span style={{ fontSize: 11, color: 'var(--txt-2)' }}>+ {rest} autre{rest > 1 ? 's' : ''} · onglet Programme</span>}

      {forecast.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="ff-label" style={{ fontSize: 9.5, color: 'var(--accent)' }}>Planning réadapté</span>
          {forecast.map((it, i) => (
            <div key={it.day.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, fontSize: 11.5 }}>
              <span style={{ color: i === 0 ? 'var(--txt-0)' : 'var(--txt-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {i === 0 ? '→ ' : ''}{it.day.short}{it.missed ? ' ↺' : ''}
              </span>
              <span className="ff-mono" style={{ flexShrink: 0, textTransform: 'capitalize', color: i === 0 ? 'var(--accent)' : 'var(--txt-2)' }}>{FF.fmtLong(it.projectedDate)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- calendrier horizontal 7 jours (semaine courante) ---------- */
function WeekCalendar({ data, onStart, desktop = false }: { data: StoreData; onStart?: (d: Day) => void; desktop?: boolean }) {
  const { TODAY, weeks, fmtISO, DAYS_FR_SHORT, currentWeek } = FF;
  const wk = weeks[Math.max(0, currentWeek - 1)];
  const days = Array.from({ length: 7 }, (_, i) => FF.addDays(wk.monday, i));
  const dayByIso = new Map(wk.days.map((d) => [d.iso, d]));
  return (
    <div style={{ display: 'flex', gap: 8, padding: desktop ? 0 : '18px 20px 0', overflowX: 'auto', scrollSnapType: 'x mandatory' }} aria-label="Calendrier de la semaine">
      {days.map((d) => {
        const iso = fmtISO(d);
        const isToday = iso === fmtISO(TODAY);
        const done = !!data.sessions[iso];
        const trainDay = dayByIso.get(iso);
        const isTrain = !!trainDay;
        const missed = isTrain && !done && d < TODAY;
        // cliquable pour lancer/rattraper : jour d'entraînement non fait, aujourd'hui ou passé
        const actionable = isTrain && !done && d <= TODAY && !!onStart;
        const inner = (
          <>
            <span className="ff-label" style={{ fontSize: 10, color: isToday ? 'var(--accent)' : missed ? 'var(--accent-2)' : 'var(--txt-2)' }}>{DAYS_FR_SHORT[d.getDay()]}</span>
            <span className="ff-mono" style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--txt-0)' : 'var(--txt-1)' }}>{d.getDate()}</span>
            <span style={{ height: 14, display: 'flex', alignItems: 'center' }}>
              {done && <FFIcon name="check" size={13} color="var(--accent-3)" strokeWidth={2.4} />}
              {missed && <FFIcon name="close" size={11} color="var(--accent-2)" strokeWidth={2} />}
              {isToday && !done && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }}></span>}
              {!done && !missed && !isToday && isTrain && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--txt-2)' }}></span>}
            </span>
          </>
        );
        const style = {
          flex: '1 0 56px', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
          padding: '12px 4px', borderRadius: 14, cursor: actionable ? 'pointer' : 'default',
          background: isToday ? 'var(--bg-2)' : 'transparent',
          border: `1px solid ${isToday ? 'var(--accent)' : missed ? 'rgba(255,61,113,0.3)' : isTrain ? 'var(--line)' : 'transparent'}`,
          boxShadow: isToday ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.16)' : 'none',
        };
        return actionable
          ? <button key={iso} className="pressable" onClick={() => onStart!(trainDay!)} aria-label={`${missed ? 'Rattraper' : 'Démarrer'} : ${trainDay!.name}`} style={style}>{inner}</button>
          : <div key={iso} style={style}>{inner}</div>;
      })}
    </div>
  );
}

/* ---------- cette semaine : barres ---------- */
function WeekBars({ data, desktop = false }: { data: StoreData; desktop?: boolean }) {
  const { weeks, TODAY, fmtISO, currentWeek } = FF;
  const week = weeks[Math.max(0, currentWeek - 1)];
  const done = week.days.filter((d) => data.sessions[d.iso]).length;
  return (
    <section style={{ margin: desktop ? 0 : '22px 20px 0' }} aria-label="Cette semaine">
      <div className="ff-label" style={{ marginBottom: 12 }}>Cette semaine</div>
      <div className="ff-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-end', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flex: 1, height: 64 }}>
          {week.days.map((d) => {
            const isDone = !!data.sessions[d.iso];
            const isToday = d.iso === fmtISO(TODAY);
            const isFuture = d.date > TODAY;
            const h = isDone ? 100 : isToday ? 38 : isFuture ? 14 : 10;
            const color = isDone ? 'var(--accent-3)' : isToday ? 'var(--accent)' : '#2A2A2A';
            return (
              <div key={d.iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: 14, height: `${h}%`, borderRadius: 4, background: color,
                  boxShadow: isDone ? '0 0 calc(10px * var(--glow)) rgba(57,255,20,0.3)' : isToday ? '0 0 calc(10px * var(--glow)) rgba(0,240,255,0.3)' : 'none',
                  transition: 'height var(--dur-slow) cubic-bezier(0.22,1,0.36,1)',
                }}></div>
                <span className="ff-mono" style={{ fontSize: 10, color: 'var(--txt-2)' }}>{['L', 'M', 'M', 'J', 'V', 'S', 'D'][d.date.getDay() === 0 ? 6 : d.date.getDay() - 1]}</span>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'right', paddingLeft: 18 }}>
          <div className="ff-mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--txt-0)' }}>{done}<span style={{ color: 'var(--txt-2)' }}>/{week.days.length}</span></div>
          <div style={{ fontSize: 11, color: 'var(--txt-1)' }}>séances</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- progression : données réelles ---------- */
function ProgressCards({ data, desktop = false }: { data: StoreData; desktop?: boolean }) {
  const wv = weeklyVolume(data);
  const weekVol = wv[Math.max(0, FF.currentWeek - 1)].volume;
  const bw = data.bodyWeight;
  const totalDone = completedCount(data);
  // dernier PR
  const lastPR = Object.values(data.sessions)
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .flatMap((s) => s.prs.map((p) => ({ ...p, iso: s.iso })))[0];
  const cardStyle = { minWidth: desktop ? 0 : 168, padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 10, flexShrink: 0 };
  return (
    <section style={{ margin: '22px 0 0' }} aria-label="Progression">
      <div className="ff-label" style={{ margin: desktop ? '0 0 12px' : '0 20px 12px' }}>Progression</div>
      <div style={desktop
        ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }
        : { display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 6px' }}>
        <div className="ff-card" style={cardStyle}>
          <span className="ff-label" style={{ fontSize: 10 }}>Volume · semaine</span>
          <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700 }}>{weekVol ? (weekVol / 1000).toFixed(1) : '0'}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> t</span></span>
          <span style={{ fontSize: 11, color: 'var(--txt-2)' }} className="ff-mono">{totalDone} séance{totalDone > 1 ? 's' : ''} loggée{totalDone > 1 ? 's' : ''}</span>
        </div>
        <div className="ff-card" style={{ ...cardStyle, borderColor: lastPR ? 'rgba(57,255,20,0.25)' : 'var(--line)' }}>
          <span className="ff-label" style={{ fontSize: 10 }}>Dernier PR</span>
          {lastPR ? (
            <>
              <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-3)' }}>{lastPR.next}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> kg</span></span>
              <span style={{ fontSize: 11, color: 'var(--txt-1)' }}>{lastPR.exercise} · était {lastPR.prev} kg</span>
            </>
          ) : (
            <>
              <span className="ff-mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--txt-2)' }}>—</span>
              <span style={{ fontSize: 11, color: 'var(--txt-2)' }}>Aucun PR pour l’instant</span>
            </>
          )}
        </div>
        <div className="ff-card" style={cardStyle}>
          <span className="ff-label" style={{ fontSize: 10 }}>Poids corporel</span>
          <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700 }}>{bw.length ? bw[bw.length - 1].value.toFixed(1) : '—'}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> kg</span></span>
          {bw.length >= 2
            ? <Sparkline points={bw.map((b) => b.value)} width={132} height={30} />
            : <span style={{ fontSize: 11, color: 'var(--txt-2)' }}>Ajoute des relevés dans Profil</span>}
        </div>
        <div className="ff-card" style={{ ...cardStyle, minWidth: desktop ? 0 : 230 }}>
          <span className="ff-label" style={{ fontSize: 10 }}>Consistance · 12 semaines</span>
          <ConsistencyHeatmap cell={10} gap={3} />
          <span style={{ fontSize: 11, color: 'var(--txt-1)' }} className="ff-mono">{totalDone} / 48 séances</span>
        </div>
      </div>
    </section>
  );
}

export function DashboardScreen({ name, heroLayout, desktop = false, onStartWorkout }: { name: string; heroLayout: string; desktop?: boolean; onStartWorkout: (d: Day) => void }) {
  const data = useStore();
  if (desktop) {
    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <div className="ff-fluid ff-stagger" style={{ padding: '10px 32px 48px' }}>
          <DashHeader name={name} data={data} desktop />
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <HeroSeance layout={heroLayout} data={data} onStart={onStartWorkout} desktop />
              <CatchUpCard data={data} onStart={onStartWorkout} desktop />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <div className="ff-label" style={{ marginBottom: 12 }}>Semaine en cours</div>
                <WeekCalendar data={data} onStart={onStartWorkout} desktop />
              </div>
              <WeekBars data={data} desktop />
            </div>
          </div>
          <ProgressCards data={data} desktop />
        </div>
      </div>
    );
  }

  return (
    <div className="ff-stagger" style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <DashHeader name={name} data={data} />
      <HeroSeance layout={heroLayout} data={data} onStart={onStartWorkout} />
      <CatchUpCard data={data} onStart={onStartWorkout} />
      <WeekCalendar data={data} onStart={onStartWorkout} />
      <WeekBars data={data} />
      <ProgressCards data={data} />
    </div>
  );
}
