# Convex — backend FitForge

Convex est **configuré et prêt**, mais pas encore activé (il faut une connexion
interactive). Tant que `VITE_CONVEX_URL` n'est pas défini, l'app continue de
tourner en **mode localStorage** comme avant — rien n'est cassé.

## Ce qui est en place

| Fichier | Rôle |
|---|---|
| `convex/schema.ts` | Schéma fidèle au modèle local : `profiles`, `sessions`, `bodyWeights`, `measurements`, `lastWeights` (indexés par `userId`). |
| `convex/profile.ts` | `get`, `upsert` |
| `convex/sessions.ts` | `list`, `save` (upsert + maj des dernières charges), `lastWeights` |
| `convex/body.ts` | `list`, `add` (upsert par date) |
| `convex/measurements.ts` | `list`, `add` (upsert par zone + date) |
| `src/main.tsx` | `ConvexProvider` conditionnel (actif seulement si `VITE_CONVEX_URL`) |
| `package.json` | dépendance `convex` + script `npm run convex` |

## Activation (3 commandes)

```bash
cd app
npm install              # installe convex (déclaré dans package.json)
npx convex dev           # 1re fois : login navigateur → crée le projet,
                         # génère convex/_generated/, écrit VITE_CONVEX_URL
                         # dans .env.local, et déploie le schéma. Laisse tourner.
```

Puis, dans un autre terminal :

```bash
npm run dev              # l'app détecte VITE_CONVEX_URL et active Convex
```

> `npx convex dev` ouvre le navigateur pour la connexion — c'est la seule étape
> que je ne peux pas faire à ta place.

## Modèle de données

Chaque ligne est rattachée à un `userId` (string) → prêt pour le multi-appareil
et l'auth. En attendant l'auth, le client passe un identifiant d'appareil
(ex. un `crypto.randomUUID()` stocké dans `localStorage`).

## Migration depuis localStorage (étape suivante, optionnelle)

`src/data/store.ts` reste la source de vérité pour l'instant. Pour basculer sur
Convex, remplacer ses mutations/sélecteurs par les hooks Convex, par ex. :

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const sessions = useQuery(api.sessions.list, { userId });      // réactif, temps réel
const save     = useMutation(api.sessions.save);
// await save({ userId, ...session })
```

À faire lors de la migration :
- générer/stocker un `userId` d'appareil ;
- remplacer `useStore()` par les `useQuery` correspondants (gérer l'état `undefined` = chargement) ;
- les sélecteurs dérivés (`weeklyVolume`, `liftSeries`, `streak`, …) peuvent rester
  côté client à partir des données renvoyées par `api.sessions.list`.

## Déploiement (Vercel)

- `npm install` sur Vercel installera `convex` automatiquement.
- Sans `VITE_CONVEX_URL` dans les variables d'env Vercel → l'app reste en mode
  localStorage (aucune régression).
- Pour la prod Convex : `npx convex deploy` et ajouter `VITE_CONVEX_URL` (prod)
  dans les variables d'environnement Vercel.
