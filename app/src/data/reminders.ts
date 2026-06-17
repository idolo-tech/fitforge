/* FitForge — rappels de séance (notifications locales).
   MVP : se déclenche à l'ouverture de l'app si une séance est prévue
   aujourd'hui et pas encore faite (1×/jour). Le vrai push en arrière-plan
   (app fermée) nécessiterait VAPID + abonnement push + planification serveur. */
import { TODAY, fmtISO, allDays, programStarted } from './program';
import type { StoreData } from './store';

const KEY = 'fitforge_reminders';          // '1' = activé
const LAST_KEY = 'fitforge_reminder_last'; // dernier iso notifié (anti-spam)

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}
export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}
export function remindersEnabled(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function setRemindersEnabled(on: boolean): void {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* ignore */ }
}

/** Active les rappels : demande la permission si besoin. Renvoie true si accordée. */
export async function enableReminders(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  let perm = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); } catch { perm = 'denied'; }
  }
  const ok = perm === 'granted';
  setRemindersEnabled(ok);
  return ok;
}

async function show(title: string, body: string): Promise<void> {
  const opts: NotificationOptions = { body, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png', tag: 'ff-session' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) { await reg.showNotification(title, opts); return; }
  } catch { /* fallback ci-dessous */ }
  try { new Notification(title, opts); } catch { /* ignore */ }
}

/** Notifie la séance du jour si : activé, permission accordée, séance prévue
 *  aujourd'hui et non faite, et pas déjà notifié aujourd'hui. */
export function maybeNotifyTodaySession(data: StoreData): void {
  if (!programStarted || !remindersEnabled()) return;
  if (notificationPermission() !== 'granted') return;
  const iso = fmtISO(TODAY);
  const today = allDays.find((d) => d.iso === iso);
  if (!today || data.sessions[iso]) return; // pas de séance aujourd'hui, ou déjà faite
  try {
    if (localStorage.getItem(LAST_KEY) === iso) return; // déjà notifié aujourd'hui
    localStorage.setItem(LAST_KEY, iso);
  } catch { /* ignore */ }
  void show('FitForge — séance du jour', `${today.name} 💪 C'est l'heure de forger.`);
}
