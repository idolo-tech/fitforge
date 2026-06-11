/* FitForge — composants partagés (exportés sur window) */

// ---------- icônes minimalistes (stroke 1.5) ----------
function FFIcon({ name, size = 22, color = 'currentColor', strokeWidth = 1.6, style }) {
  const paths = {
    home: <><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></>,
    program: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3v4M16 3v4" /></>,
    journal: <><path d="M5 19V10M10.5 19V5.5M16 19v-7M21 19H3" /></>,
    profile: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" /></>,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7.5" /></>,
    chevronR: <><path d="M9 5l7 7-7 7" /></>,
    chevronL: <><path d="M15 5l-7 7 7 7" /></>,
    chevronD: <><path d="M5 9l7 7 7-7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    play: <><path d="M8 5.5v13l11-6.5z" /></>,
    flame: <><path d="M12 3c1 3-4 5-4 10a4 4 0 008 0c0-2-1-3.5-1.5-4.5C14 10 12.8 11 13 13" /></>,
    timer: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 2M9.5 3h5" /></>,
    share: <><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="M8.2 10.9l6.6-3.8M8.2 13.1l6.6 3.8" /></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><circle cx="12" cy="13.5" r="3.6" /><path d="M8.5 7L10 4.5h4L15.5 7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" /></>,
    dumbbell: <><path d="M7 8v8M17 8v8M4 9.5v5M20 9.5v5M7 12h10" /></>,
    arrowUp: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    arrowDown: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    swap: <><path d="M7 4v12M7 4L4 7M7 4l3 3M17 20V8M17 20l3-3M17 20l-3-3" /></>,
    moon: <><path d="M19 14A8 8 0 1110 5a6.5 6.5 0 009 9z" /></>,
    download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {paths[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

// ---------- bouton néon principal ----------
function NeonButton({ children, onClick, color = 'var(--accent)', textColor = '#000', pulse = false, style, disabled }) {
  return (
    <button
      className="pressable ff-display"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 56, borderRadius: 14,
        background: disabled ? 'var(--bg-2)' : color,
        color: disabled ? 'var(--txt-2)' : textColor,
        fontSize: 17, fontWeight: 700, letterSpacing: '0.08em',
        boxShadow: disabled ? 'none' : `0 0 calc(28px * var(--glow)) ${color}33, 0 0 calc(8px * var(--glow)) ${color}55`,
        animation: pulse && !disabled ? 'ff-pulse-soft calc(3s * var(--speed)) ease-in-out infinite' : 'none',
        ...style,
      }}
    >{children}</button>
  );
}

// ---------- badge ----------
function FFBadge({ children, color = 'var(--txt-1)', bg = 'var(--bg-2)', style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, background: bg, color,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

// ---------- progress ring SVG ----------
function ProgressRing({ progress, size = 220, stroke = 5, color = 'var(--accent)', track = '#1A1A1A', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 calc(6px * var(--glow)) ${color === 'var(--accent)' ? 'rgba(0,240,255,0.6)' : color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ---------- sparkline ----------
function Sparkline({ points, width = 120, height = 36, color = 'var(--accent)', fill = true }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const px = (i) => (i / (points.length - 1)) * (width - 6) + 3;
  const py = (v) => height - 5 - ((v - min) / span) * (height - 10);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={`${d} L${px(points.length - 1)},${height} L${px(0)},${height} Z`} fill={color} opacity="0.08" stroke="none" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(points.length - 1)} cy={py(points[points.length - 1])} r="2.6" fill={color} />
    </svg>
  );
}

// ---------- heatmap de consistance (style contributions) ----------
function ConsistencyHeatmap({ cell = 14, gap = 4 }) {
  const { weeks, history, TODAY } = window.FF;
  return (
    <div style={{ display: 'flex', gap }}>
      {weeks.slice(0, 12).map((w) => (
        <div key={w.number} style={{ display: 'flex', flexDirection: 'column', gap }}>
          {w.days.map((d) => {
            const s = history[d.iso];
            let bg = '#111111', glow = 'none';
            if (s && s.status === 'completed') {
              const intensity = Math.min(1, (s.volume || 1500) / 5000);
              bg = `rgba(57, 255, 20, ${0.25 + intensity * 0.6})`;
            } else if (s && s.status === 'missed') bg = 'rgba(255, 61, 113, 0.22)';
            else if (d.iso === window.FF.fmtISO(TODAY)) { bg = 'rgba(0, 240, 255, 0.5)'; glow = '0 0 calc(8px * var(--glow)) rgba(0,240,255,0.5)'; }
            return <div key={d.iso} title={`${d.short} — ${d.iso}`}
              style={{ width: cell, height: cell, borderRadius: 3.5, background: bg, boxShadow: glow }} />;
          })}
        </div>
      ))}
    </div>
  );
}

// ---------- compteur animé ----------
function useCountUp(target, duration = 1000, deps = []) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed')) || 1;
    const dur = duration * speed;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, deps.length ? deps : [target]);
  return val;
}

// ---------- confettis (particules cyan/vert) ----------
function Confetti({ count = 36 }) {
  const parts = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1.6 + Math.random() * 1.4,
    size: 4 + Math.random() * 5,
    color: ['#00F0FF', '#39FF14', '#FFFFFF'][i % 3],
    round: Math.random() > 0.5,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      {parts.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: `${p.left}%`,
          width: p.size, height: p.round ? p.size : p.size * 2.2,
          borderRadius: p.round ? '50%' : 2, background: p.color, opacity: 0.9,
          animation: `ff-confetti-fall calc(${p.dur}s * var(--speed)) ${p.delay}s cubic-bezier(0.3,0,0.8,1) forwards`,
        }} />
      ))}
    </div>
  );
}

// ---------- segmented control ----------
function Segmented({ options, value, onChange, style }) {
  return (
    <div style={{ display: 'flex', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12, padding: 3, gap: 2, ...style }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="pressable"
          style={{
            flex: 1, padding: '8px 6px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
            background: value === o ? 'var(--bg-2)' : 'transparent',
            color: value === o ? 'var(--accent)' : 'var(--txt-1)',
            boxShadow: value === o ? '0 0 calc(12px * var(--glow)) rgba(0,240,255,0.12)' : 'none',
          }}>{o}</button>
      ))}
    </div>
  );
}

// ---------- stepper +/- (poids, reps) ----------
function Stepper({ label, value, onChange, step = 1, unit = '', min = 0, format }) {
  const display = format ? format(value) : value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      <span className="ff-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="pressable" onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          aria-label={`Diminuer ${label}`}
          style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-1)', flexShrink: 0 }}>
          <FFIcon name="minus" size={18} />
        </button>
        <div className="ff-mono" style={{ minWidth: 64, textAlign: 'center', fontSize: 26, fontWeight: 700 }}>
          {display}<span style={{ fontSize: 12, color: 'var(--txt-1)', marginLeft: 2 }}>{unit}</span>
        </div>
        <button className="pressable" onClick={() => onChange(+(value + step).toFixed(1))}
          aria-label={`Augmenter ${label}`}
          style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <FFIcon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------- sélecteur RIR ----------
function RIRSelector({ value, onChange }) {
  const colors = ['#FF3D71', '#FF9F43', '#39FF14', '#39FF14', '#4A4A4A'];
  const labels = ['Échec', 'Très dur', 'Dur', 'Solide', 'Facile'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <span className="ff-label">RIR — reps en réserve</span>
      <div style={{ display: 'flex', gap: 14 }}>
        {[0, 1, 2, 3, 4].map((n) => {
          const active = value === n;
          return (
            <button key={n} className="pressable" onClick={() => onChange(n)} aria-label={`RIR ${n}`}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `1.5px solid ${active ? colors[n] : 'var(--line)'}`,
                background: active ? colors[n] : 'transparent',
                color: active ? '#000' : 'var(--txt-1)',
                fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
                boxShadow: active ? `0 0 calc(14px * var(--glow)) ${colors[n]}66` : 'none',
                transition: 'all var(--dur-fast) ease',
              }}>{n}</button>
          );
        })}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--txt-2)', height: 14 }}>
        {value != null ? labels[value] : ''}
      </span>
    </div>
  );
}

// ---------- placeholder imagerie exercice ----------
function ExercisePlaceholder({ label, height = 180, style }) {
  return (
    <div className="ff-placeholder" style={{
      height, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.2), rgba(5,5,5,0.9))' }}></div>
      <span className="ff-mono" style={{ position: 'relative', fontSize: 11, color: 'var(--txt-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        ▦ {label}
      </span>
    </div>
  );
}

// ---------- ligne de stat compacte ----------
function StatBlock({ label, value, unit, color = 'var(--txt-0)', size = 32 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="ff-label">{label}</span>
      <span className="ff-mono" style={{ fontSize: size, fontWeight: 700, color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: size * 0.42, color: 'var(--txt-1)', fontWeight: 500 }}>{unit ? ` ${unit}` : ''}</span>
      </span>
    </div>
  );
}

Object.assign(window, {
  FFIcon, NeonButton, FFBadge, ProgressRing, Sparkline, ConsistencyHeatmap,
  useCountUp, Confetti, Segmented, Stepper, RIRSelector, ExercisePlaceholder, StatBlock,
});
