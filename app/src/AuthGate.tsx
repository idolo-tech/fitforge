/* FitForge — gating d'authentification (Convex Auth).
   AuthLoading → écran de chargement · Unauthenticated → connexion ·
   Authenticated → app (profil chargé depuis le compte). */
import { AuthLoading, Authenticated, Unauthenticated, useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../convex/_generated/api';
import FitForgeApp from './App';
import { ConvexSync } from './data/ConvexSync';
import { resetLocalStore } from './data/store';
import { SignInScreen } from './screens/SignIn';
import { ForgeLogo } from './screens/Onboarding';
import type { Profile } from './screens/Profile';

function Boot() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
      <ForgeLogo size={92} animate={false} />
    </div>
  );
}

function AuthedApp() {
  const profileDoc = useQuery(api.profile.get);
  const upsert = useMutation(api.profile.upsert);
  const { signOut } = useAuthActions();

  if (profileDoc === undefined) return <Boot />; // profil en cours de chargement

  const profile: Profile | null = profileDoc
    ? { name: profileDoc.name, weight: profileDoc.weight, height: profileDoc.height, goal: profileDoc.goal }
    : null;

  return (
    <>
      <ConvexSync />
      <FitForgeApp
        authMode
        authProfile={profile}
        onSaveProfile={async (p) => { await upsert({ name: p.name, weight: p.weight, height: p.height, goal: p.goal }); }}
        onSignOut={() => { void signOut().then(resetLocalStore); }}
      />
    </>
  );
}

export function AuthGate() {
  return (
    <>
      <AuthLoading><Boot /></AuthLoading>
      <Unauthenticated><SignInScreen /></Unauthenticated>
      <Authenticated><AuthedApp /></Authenticated>
    </>
  );
}
