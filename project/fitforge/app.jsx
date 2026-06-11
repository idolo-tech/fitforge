/* FitForge — shell applicatif + navigation + Tweaks */

const FF_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "timerDesign": "Ring",
  "heroLayout": "Immersif",
  "gesture": "Swipe",
  "glow": 100,
  "speed": 100
}/*EDITMODE-END*/;

function BottomNav({ tab, onChange }) {
  const items = [
    { id: 'dashboard', icon: 'home', label: 'Dashboard' },
    { id: 'program', icon: 'program', label: 'Programme' },
    { id: 'journal', icon: 'journal', label: 'Journal' },
    { id: 'profile', icon: 'profile', label: 'Profil' },
  ];
  return (
    <nav aria-label="Navigation principale" style={{
      position: 'absolute', left: 16, right: 16, bottom: 'calc(14px + env(safe-area-inset-bottom))',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--line)', borderRadius: 20, padding: '6px 8px', zIndex: 20,
    }}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button key={it.id} className="pressable" onClick={() => onChange(it.id)} aria-label={it.label}
            style={{
              width: 58, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'rgba(0,240,255,0.08)' : 'transparent',
              boxShadow: active ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.15)' : 'none',
            }}>
            <FFIcon name={it.icon} size={22} color={active ? 'var(--accent)' : 'var(--txt-2)'} strokeWidth={active ? 2 : 1.6} />
          </button>
        );
      })}
    </nav>
  );
}

function FitForgeApp() {
  const [t, setTweak] = useTweaks(FF_TWEAK_DEFAULTS);

  // phase : splash | onboarding | main
  const stored = (() => { try { return JSON.parse(localStorage.getItem('fitforge_profile') || 'null'); } catch { return null; } })();
  const [phase, setPhase] = React.useState(stored ? 'main' : 'splash');
  const [name, setName] = React.useState(stored ? stored.name : 'Alex');
  const [tab, setTab] = React.useState('dashboard');
  const [workout, setWorkout] = React.useState(false);
  const [summary, setSummary] = React.useState(null);
  const [share, setShare] = React.useState(false);

  // applique glow & speed sur :root
  React.useEffect(() => {
    document.documentElement.style.setProperty('--glow', String(t.glow / 100));
    document.documentElement.style.setProperty('--speed', String(100 / Math.max(25, t.speed)));
  }, [t.glow, t.speed]);

  const completeOnboarding = (n) => {
    setName(n);
    try { localStorage.setItem('fitforge_profile', JSON.stringify({ name: n })); } catch {}
    setPhase('main');
  };
  const replay = () => {
    try { localStorage.removeItem('fitforge_profile'); } catch {}
    setTab('dashboard'); setPhase('splash');
  };

  return (
    <div className="ff-stage">
      <div className="ff-app">
        {phase === 'splash' && <SplashScreen onDone={() => setPhase('onboarding')} />}
        {phase === 'onboarding' && <OnboardingScreen onDone={completeOnboarding} />}

        {phase === 'main' && (
          <>
            <div key={tab} className="anim-fade-up" style={{ height: '100%' }} data-screen-label={tab}>
              {tab === 'dashboard' && <DashboardScreen name={name} heroLayout={t.heroLayout} onStartWorkout={() => setWorkout(true)} />}
              {tab === 'program' && <ProgramScreen onStartWorkout={() => setWorkout(true)} />}
              {tab === 'journal' && <JournalScreen />}
              {tab === 'profile' && <ProfileScreen name={name} onReplayOnboarding={replay} />}
            </div>
            {!workout && !summary && <BottomNav tab={tab} onChange={setTab} />}
          </>
        )}

        {workout && (
          <WorkoutPlayer
            gesture={t.gesture}
            timerDesign={t.timerDesign}
            onQuit={() => setWorkout(false)}
            onFinish={(s) => { setWorkout(false); setSummary(s); }}
          />
        )}

        {summary && (
          <SummaryScreen session={summary} onShare={() => setShare(true)} onHome={() => { setSummary(null); setTab('dashboard'); }} />
        )}
        {share && summary && <ShareCard session={summary} onClose={() => setShare(false)} />}

        <TweaksPanel>
          <TweakSection label="Explorations UX" />
          <TweakRadio label="Timer de repos" value={t.timerDesign} options={['Ring', 'Liquide', 'Minimal']} onChange={(v) => setTweak('timerDesign', v)} />
          <TweakRadio label="Hero dashboard" value={t.heroLayout} options={['Immersif', 'Compact', 'Split']} onChange={(v) => setTweak('heroLayout', v)} />
          <TweakRadio label="Validation série" value={t.gesture} options={['Swipe', 'Bouton']} onChange={(v) => setTweak('gesture', v)} />
          <TweakSection label="Ambiance" />
          <TweakSlider label="Intensité du glow" value={t.glow} min={0} max={150} step={5} unit="%" onChange={(v) => setTweak('glow', v)} />
          <TweakSlider label="Vitesse animations" value={t.speed} min={50} max={200} step={10} unit="%" onChange={(v) => setTweak('speed', v)} />
        </TweaksPanel>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<FitForgeApp />);
