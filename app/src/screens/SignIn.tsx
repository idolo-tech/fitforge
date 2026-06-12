/* FitForge — écran de connexion / inscription (Convex Auth, provider Password) */
import React from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { NeonButton } from '../components/ui';
import { ForgeLogo } from './Onboarding';

export function SignInScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = React.useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email) || password.length < 6) {
      setError('Email valide + mot de passe d’au moins 6 caractères.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // succès → l'état d'auth bascule, <Authenticated> prend le relais (ce composant se démonte)
      await signIn('password', { email: email.trim(), password, flow });
    } catch {
      setError(flow === 'signIn'
        ? 'Email ou mot de passe incorrect.'
        : 'Création impossible (email déjà utilisé ?).');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 14,
    padding: '15px 16px', fontSize: 16, color: 'var(--txt-0)', outline: 'none',
    fontFamily: 'var(--font-body)', width: '100%',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', padding: 24, zIndex: 90,
    }}>
      <div className="ff-center-col anim-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <ForgeLogo size={82} animate={false} />
        <div style={{ textAlign: 'center' }}>
          <div className="ff-display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.04em' }}>
            FIT<span style={{ color: 'var(--accent)' }}>FORGE</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--txt-1)', marginTop: 6 }}>
            {flow === 'signIn' ? 'Connexion à ton compte' : 'Crée ton compte'}
          </div>
        </div>

        <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" style={inputStyle} />
          <input type="password" autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" aria-label="Mot de passe" style={inputStyle} />
          {error && (
            <div role="alert" style={{ fontSize: 12.5, color: 'var(--accent-2)', lineHeight: 1.4 }}>{error}</div>
          )}
          <NeonButton disabled={loading}>
            {loading ? '…' : flow === 'signIn' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
          </NeonButton>
        </form>

        <button type="button" className="pressable"
          onClick={() => { setError(null); setFlow(flow === 'signIn' ? 'signUp' : 'signIn'); }}
          style={{ fontSize: 13, color: 'var(--txt-1)' }}>
          {flow === 'signIn' ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}
