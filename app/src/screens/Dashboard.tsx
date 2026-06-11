/* FitForge — Dashboard */
import { FFIcon } from '../components/icons';
import { NeonButton, FFBadge, Sparkline, ConsistencyHeatmap, ExercisePlaceholder } from '../components/ui';
import * as FF from '../data/program';

function DashHeader({ name, desktop = false }: { name: string; desktop?: boolean }) {
  const { TODAY, streak, fmtLong } = FF;
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--accent-2)', fontSize: 13, fontWeight: 700 }} className="ff-mono">
            <span style={{ display: 'inline-block', animation: streak > 3 ? 'ff-flame calc(1.4s * var(--speed)) ease-in-out infinite' : 'none' }}>
              <FFIcon name="flame" size={15} color="var(--accent-2)" strokeWidth={2} />
            </span>
            {streak}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--txt-1)', textTransform: 'capitalize' }}>{fmtLong(TODAY)} · Semaine 4</div>
      </div>
    </header>
  );
}

/* ---------- hero « séance du jour » : 3 variantes ---------- */
function HeroSeance({ layout, onStart, desktop = false }: { layout: string; onStart: () => void; desktop?: boolean }) {
  const day = FF.todayDay;
  if (!day) return null;
  const nEx = day.exercises.length;
  const dur = '~55 min';
  const m = desktop ? { margin: 0 } : undefined;

  const Meta = () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <FFBadge bg="rgba(26,26,26,0.85)"><FFIcon name="timer" size={13} /> {dur}</FFBadge>
      <FFBadge bg="rgba(26,26,26,0.85)"><FFIcon name="dumbbell" size={13} /> {nEx} exercices</FFBadge>
      <FFBadge bg="rgba(26,26,26,0.85)">{day.location}</FFBadge>
    </div>
  );

  if (layout === 'Compact') {
    return (
      <section className="ff-card anim-fade-up" style={{ margin: '14px 20px 0', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, ...m }} aria-label="Séance du jour">
        <div className="ff-label" style={{ color: 'var(--accent)' }}>Séance du jour</div>
        <h2 className="ff-display" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{day.name}</h2>
        <Meta />
        <NeonButton pulse onClick={onStart}>DÉMARRER</NeonButton>
      </section>
    );
  }

  if (layout === 'Split') {
    return (
      <section className="ff-card anim-fade-up" style={{ margin: '14px 20px 0', overflow: 'hidden', display: 'grid', gridTemplateColumns: '104px 1fr', ...m }} aria-label="Séance du jour">
        <ExercisePlaceholder label="visuel" height="100%" style={{ borderRight: '1px solid var(--line)' }} />
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ff-label" style={{ color: 'var(--accent)' }}>Séance du jour</div>
          <h2 className="ff-display" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.12 }}>{day.name}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FFBadge>{dur}</FFBadge><FFBadge>{nEx} exercices</FFBadge>
          </div>
          <NeonButton pulse onClick={onStart} style={{ height: 48, fontSize: 15 }}>DÉMARRER</NeonButton>
        </div>
      </section>
    );
  }

  // Immersif (défaut)
  return (
    <section className="anim-fade-up" style={{ margin: '14px 20px 0', borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', border: '1px solid var(--line)', ...m }} aria-label="Séance du jour">
      <ExercisePlaceholder label={`photo — ${day.short.toLowerCase()}`} height={desktop ? 360 : 290} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.1) 20%, rgba(5,5,5,0.92) 78%)' }}></div>
      <div style={{ position: 'absolute', inset: 0, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
        <div className="ff-label" style={{ color: 'var(--accent)' }}>Séance du jour</div>
        <h2 className="ff-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.08 }}>{day.name}</h2>
        <Meta />
        <NeonButton pulse onClick={onStart}>DÉMARRER</NeonButton>
      </div>
    </section>
  );
}

/* ---------- calendrier horizontal 7 jours ---------- */
function WeekCalendar({ desktop = false }: { desktop?: boolean }) {
  const { TODAY, weeks, history, fmtISO, DAYS_FR_SHORT } = FF;
  // semaine courante : lundi 6 juillet
  const monday = weeks[3].monday;
  const days = Array.from({ length: 7 }, (_, i) => FF.addDays(monday, i));
  const trainISO = new Set(weeks[3].days.map((d) => d.iso));
  return (
    <div style={{ display: 'flex', gap: 8, padding: desktop ? 0 : '18px 20px 0', overflowX: 'auto', scrollSnapType: 'x mandatory' }} aria-label="Calendrier de la semaine">
      {days.map((d) => {
        const iso = fmtISO(d);
        const isToday = iso === fmtISO(TODAY);
        const s = history[iso];
        const isTrain = trainISO.has(iso);
        return (
          <div key={iso} style={{
            flex: '1 0 56px', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '12px 4px', borderRadius: 14,
            background: isToday ? 'var(--bg-2)' : 'transparent',
            border: `1px solid ${isToday ? 'var(--accent)' : isTrain ? 'var(--line)' : 'transparent'}`,
            boxShadow: isToday ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.16)' : 'none',
          }}>
            <span className="ff-label" style={{ fontSize: 10, color: isToday ? 'var(--accent)' : 'var(--txt-2)' }}>{DAYS_FR_SHORT[d.getDay()]}</span>
            <span className="ff-mono" style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--txt-0)' : 'var(--txt-1)' }}>{d.getDate()}</span>
            <span style={{ height: 14, display: 'flex', alignItems: 'center' }}>
              {s && s.status === 'completed' && <FFIcon name="check" size={13} color="var(--accent-3)" strokeWidth={2.4} />}
              {s && s.status === 'missed' && <FFIcon name="close" size={11} color="var(--txt-2)" strokeWidth={2} />}
              {isToday && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }}></span>}
              {!s && !isToday && isTrain && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--txt-2)' }}></span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- cette semaine : barres ---------- */
function WeekBars({ desktop = false }: { desktop?: boolean }) {
  const { weeks, history, TODAY, fmtISO } = FF;
  const week = weeks[3];
  const done = week.days.filter((d) => history[d.iso] && history[d.iso].status === 'completed').length;
  return (
    <section style={{ margin: desktop ? 0 : '22px 20px 0' }} aria-label="Cette semaine">
      <div className="ff-label" style={{ marginBottom: 12 }}>Cette semaine</div>
      <div className="ff-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-end', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flex: 1, height: 64 }}>
          {week.days.map((d) => {
            const s = history[d.iso];
            const isToday = d.iso === fmtISO(TODAY);
            const isFuture = d.date > TODAY;
            const h = s && s.status === 'completed' ? 100 : isToday ? 38 : isFuture ? 14 : 10;
            const color = s && s.status === 'completed' ? 'var(--accent-3)' : isToday ? 'var(--accent)' : '#2A2A2A';
            return (
              <div key={d.iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: 14, height: `${h}%`, borderRadius: 4, background: color,
                  boxShadow: s && s.status === 'completed' ? '0 0 calc(10px * var(--glow)) rgba(57,255,20,0.3)' : isToday ? '0 0 calc(10px * var(--glow)) rgba(0,240,255,0.3)' : 'none',
                  transition: 'height var(--dur-slow) cubic-bezier(0.22,1,0.36,1)',
                }}></div>
                <span className="ff-mono" style={{ fontSize: 10, color: 'var(--txt-2)' }}>{['', 'L', 'M', 'M', 'J', 'V', 'S', 'D'][d.date.getDay() === 0 ? 7 : d.date.getDay()]}</span>
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

/* ---------- progression : scroll horizontal (mobile) / grille (desktop) ---------- */
function ProgressCards({ desktop = false }: { desktop?: boolean }) {
  const { weeklyVolume, lastPR, bodyWeight } = FF;
  const weekVol = weeklyVolume[3].volume || weeklyVolume[2].volume;
  const cardStyle = { minWidth: desktop ? 0 : 168, padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 10, flexShrink: 0 };
  return (
    <section style={{ margin: desktop ? '22px 0 0' : '22px 0 0' }} aria-label="Progression">
      <div className="ff-label" style={{ margin: desktop ? '0 0 12px' : '0 20px 12px' }}>Progression</div>
      <div style={desktop
        ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }
        : { display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 6px' }}>
        <div className="ff-card" style={cardStyle}>
          <span className="ff-label" style={{ fontSize: 10 }}>Volume · semaine</span>
          <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700 }}>{(weekVol / 1000).toFixed(1)}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> t</span></span>
          <span style={{ fontSize: 11, color: 'var(--accent-3)' }} className="ff-mono">▲ +8% vs S3</span>
        </div>
        <div className="ff-card" style={{ ...cardStyle, borderColor: 'rgba(57,255,20,0.25)' }}>
          <span className="ff-label" style={{ fontSize: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            Dernier PR
            <span className="ff-mono" style={{ background: 'var(--accent-3)', color: '#000', padding: '1px 6px', borderRadius: 5, fontSize: 9, fontWeight: 700, animation: 'ff-pr-pulse calc(2s * var(--speed)) ease-in-out infinite' }}>NEW</span>
          </span>
          <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-3)' }}>{lastPR.next}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> kg</span></span>
          <span style={{ fontSize: 11, color: 'var(--txt-1)' }}>{lastPR.exercise} · était {lastPR.prev} kg</span>
        </div>
        <div className="ff-card" style={cardStyle}>
          <span className="ff-label" style={{ fontSize: 10 }}>Poids corporel</span>
          <span className="ff-mono" style={{ fontSize: 28, fontWeight: 700 }}>{bodyWeight[bodyWeight.length - 1].value.toFixed(1)}<span style={{ fontSize: 13, color: 'var(--txt-1)' }}> kg</span></span>
          <Sparkline points={bodyWeight.map((b) => b.value)} width={132} height={30} />
        </div>
        <div className="ff-card" style={{ ...cardStyle, minWidth: desktop ? 0 : 230, gridColumn: desktop ? 'span 1' : undefined }}>
          <span className="ff-label" style={{ fontSize: 10 }}>Consistance · 12 semaines</span>
          <ConsistencyHeatmap cell={10} gap={3} />
          <span style={{ fontSize: 11, color: 'var(--txt-1)' }} className="ff-mono">{FF.completedCount} séances · 1 manquée</span>
        </div>
      </div>
    </section>
  );
}

export function DashboardScreen({ name, heroLayout, desktop = false, onStartWorkout }: { name: string; heroLayout: string; desktop?: boolean; onStartWorkout: () => void }) {
  if (desktop) {
    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <div className="ff-fluid" style={{ padding: '10px 32px 48px' }}>
          <DashHeader name={name} desktop />
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 16, alignItems: 'start' }}>
            <HeroSeance layout={heroLayout} onStart={onStartWorkout} desktop />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <div className="ff-label" style={{ marginBottom: 12 }}>Semaine en cours</div>
                <WeekCalendar desktop />
              </div>
              <WeekBars desktop />
            </div>
          </div>
          <ProgressCards desktop />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <DashHeader name={name} />
      <HeroSeance layout={heroLayout} onStart={onStartWorkout} />
      <WeekCalendar />
      <WeekBars />
      <ProgressCards />
    </div>
  );
}
