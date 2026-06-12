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

## Synchronisation localStorage ↔ Convex (FAIT)

La bascule est implémentée via un **pont** plutôt qu'une réécriture des écrans :

- `src/data/userId.ts` — identifiant d'appareil stable (localStorage).
- `src/data/ConvexSync.tsx` — monté sous `ConvexProvider` (dans `main.tsx`), ne
  rend rien. Il :
  1. branche les mutations Convex (`sessions.save`, `body.add`, `measurements.add`)
     sur le store via `setCloudBackend()` ;
  2. lit en temps réel (`useQuery`) sessions / poids / mensurations / dernières
     charges et les **fusionne** dans le store (`hydrateFromCloud`, le cloud gagne
     en cas de conflit) ;
  3. au 1ᵉʳ chargement, **pousse vers le cloud les données locales absentes**
     (aucune perte des données pré-Convex).
- `src/data/store.ts` — inchangé côté API (`useStore()`, `getData()`, sélecteurs
  identiques). Les mutations font une mise à jour **optimiste locale** + écriture
  Convex en arrière-plan. **localStorage reste le cache offline.**

Résultat : écriture instantanée, fonctionne hors-ligne, persisté + synchronisé
multi-appareils dès que le réseau revient. Aucun écran n'a été modifié.

> Prochaine étape possible : **Convex Auth** pour remplacer l'`userId` d'appareil
> par un vrai compte (multi-utilisateur).

## Déploiement (Vercel)

- `npm install` sur Vercel installera `convex` automatiquement.
- Sans `VITE_CONVEX_URL` dans les variables d'env Vercel → l'app reste en mode
  localStorage (aucune régression).
- Pour la prod Convex : `npx convex deploy` et ajouter `VITE_CONVEX_URL` (prod)
  dans les variables d'environnement Vercel.
