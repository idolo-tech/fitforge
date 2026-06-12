/* FitForge — shell applicatif + navigation responsive + Tweaks */
import React from 'react';
import { FFIcon } from './components/icons';
import type { IconName } from './components/icons';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider } from './components/TweaksPanel';
import { useIsDesktop } from './hooks/useMediaQuery';
import { SplashScreen, OnboardingScreen } from './screens/Onboarding';
import type { OnboardingResult } from './screens/Onboarding';
import { DashboardScreen } from './screens/Dashboard';
import { ProgramScreen } from './screens/Program';
import { JournalScreen } from './screens/Journal';
import { ProfileScreen } from './screens/Profile';
import type { Profile } from './screens/Profile';
import { WorkoutPlayer } from './screens/WorkoutPlayer';
import { SummaryScreen, ShareCard } from './screens/WorkoutExtras';
import { seedBodyWeight } from './data/store';
import { user as DEFAULT_USER } from './data/program';
import type { SessionSummary, Day } from './data/types';

// Recharts est lourd → l'écran Analyse est chargé à la demande (code-split)
const AnalyseScreen = React.lazy(() => import('./screens/Analyse').then((m) => ({ default: m.AnalyseScreen })));

const FF_TWEAK_DEFAULTS = {
  timerDesign: 'Ring',
  heroLayout: 'Immersif',
  gesture: 'Swipe',
  glow: 100,
  speed: 100,
};

const PROFILE_KEY = 'fitforge_profile';
function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_USER, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return null;
}

type Tab = 'dashboard' | 'program' | 'journal' | 'analyse' | 'profile';

const NAV_ITEMS: { id: Tab; icon: IconName; label: string }[] = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard' },
  { id: 'program', icon: 'program', label: 'Programme' },
  { id: 'journal', icon: 'journal', label: 'Journal' },
  { id: 'analyse', icon: 'chart', label: 'Analyse' },
  { id: 'profile', icon: 'profile', label: 'Profil' },
];

/* mobile : barre flottante en bas */
function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav aria-label="Navigation principale" style={{
      position: 'absolute', left: 16, right: 16, bottom: 'calc(14px + env(safe-area-inset-bottom))',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--line)', borderRadius: 20, padding: '6px 8px', zIndex: 20,
      maxWidth: 520, margin: '0 auto',
    }}>
      {NAV_ITEMS.map((it) => {
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

/* desktop : barre horizontale en haut, brand + onglets */
function TopNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="ff-topnav" aria-label="Navigation principale">
      <div className="ff-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', marginRight: 12 }}>
        FIT<span style={{ color: 'var(--accent)' }}>FORGE</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((it) => {
          const active = tab === it.id;
          return (
            <button key={it.id} className="pressable" onClick={() => onChange(it.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', borderRadius: 12,
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
                background: active ? 'rgba(0,240,255,0.08)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--txt-1)',
                boxShadow: active ? '0 0 calc(16px * var(--glow)) rgba(0,240,255,0.12)' : 'none',
              }}>
              <FFIcon name={it.icon} size={18} color={active ? 'var(--accent)' : 'var(--txt-2)'} strokeWidth={active ? 2 : 1.6} />
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface FitForgeAppProps {
  /** mode authentifié (Convex Auth) : le profil vient du compte, pas du localStorage */
  authMode?: boolean;
  authProfile?: Profile | null;
  onSaveProfile?: (p: Profile) => void | Promise<void>;
  onSignOut?: () => void;
  /** appelé quand une séance est terminée (déclenche le Coach IA en arrière-plan) */
  onSessionFinish?: () => void;
}

export default function FitForgeApp({ authMode = false, authProfile = null, onSaveProfile, onSignOut, onSessionFinish }: FitForgeAppProps = {}) {
  const [t, setTweak] = useTweaks(FF_TWEAK_DEFAULTS);
  const desktop = useIsDesktop();

  const [profile, setProfile] = React.useState<Profile | null>(() => (authMode ? authProfile : loadProfile()));
  // en mode auth, l'écran de connexion a déjà servi d'entrée → on saute le splash
  const [phase, setPhase] = React.useState<'splash' | 'onboarding' | 'main'>(
    () => ((authMode ? authProfile : loadProfile()) ? 'main' : authMode ? 'onboarding' : 'splash'),
  );
  const [tab, setTab] = React.useState<Tab>('dashboard');
  const [workoutDay, setWorkoutDay] = React.useState<Day | null>(null);
  const [summary, setSummary] = React.useState<SessionSummary | null>(null);
  const [share, setShare] = React.useState(false);

  const name = profile?.name || DEFAULT_USER.name;

  // applique glow & speed sur :root
  React.useEffect(() => {
    document.documentElement.style.setProperty('--glow', String(t.glow / 100));
    document.documentElement.style.setProperty('--speed', String(100 / Math.max(25, t.speed)));
  }, [t.glow, t.speed]);

  const completeOnboarding = (p: OnboardingResult) => {
    const prof: Profile = { name: p.name, weight: p.weight, height: p.height, goal: p.goal };
    if (authMode) {
      void onSaveProfile?.(prof);              // persiste le profil sur le compte (Convex)
    } else {
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(prof)); } catch { /* ignore */ }
    }
    seedBodyWeight(p.weight);
    setProfile(prof);
    setPhase('main');
  };
  const replay = () => {
    try { localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ }
    setProfile(null); setTab('dashboard'); setPhase('splash');
  };

  const showBottomNav = phase === 'main' && !desktop && !workoutDay && !summary;

  return (
    <div className="ff-stage">
      <div className="ff-app">
        {phase === 'main' && desktop && !workoutDay && !summary && <TopNav tab={tab} onChange={setTab} />}

        <div className="ff-app-main">
          {phase === 'splash' && <SplashScreen onDone={() => setPhase('onboarding')} />}
          {phase === 'onboarding' && <OnboardingScreen onDone={completeOnboarding} desktop={desktop} />}

          {phase === 'main' && (
            <div key={tab} style={{ height: '100%' }} data-screen-label={tab}>
              {tab === 'dashboard' && <DashboardScreen name={name} heroLayout={t.heroLayout} desktop={desktop} onStartWorkout={setWorkoutDay} />}
              {tab === 'program' && <ProgramScreen desktop={desktop} onStartWorkout={setWorkoutDay} />}
              {tab === 'journal' && <JournalScreen desktop={desktop} />}
              {tab === 'analyse' && (
                <React.Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: 'var(--txt-2)', fontSize: 13 }}>Chargement…</div>}>
                  <AnalyseScreen desktop={desktop} />
                </React.Suspense>
              )}
              {tab === 'profile' && profile && <ProfileScreen profile={profile} desktop={desktop} convexEnabled={authMode} onReplayOnboarding={authMode ? undefined : replay} onSignOut={onSignOut} />}
            </div>
          )}

          {showBottomNav && <BottomNav tab={tab} onChange={setTab} />}
        </div>

        {workoutDay && (
          <WorkoutPlayer
            day={workoutDay}
            gesture={t.gesture}
            timerDesign={t.timerDesign}
            desktop={desktop}
            onQuit={() => setWorkoutDay(null)}
            onFinish={(s) => { setWorkoutDay(null); setSummary(s); onSessionFinish?.(); }}
          />
        )}

        {summary && (
          <SummaryScreen session={summary} desktop={desktop} onShare={() => setShare(true)} onHome={() => { setSummary(null); setTab('dashboard'); }} />
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
