/* FitForge — identifiant d'appareil stable (en attendant une vraie auth).
   Rattache les données Convex à cet appareil. Persisté en localStorage. */
const KEY = 'fitforge_user_id';

export function getUserId(): string {
  let id: string | null = null;
  try { id = localStorage.getItem(KEY); } catch { /* ignore */ }
  if (!id) {
    id = (globalThis.crypto?.randomUUID?.() ?? `u_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  }
  return id;
}
