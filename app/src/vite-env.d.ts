/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL du déploiement Convex — écrite automatiquement par `npx convex dev`. */
  readonly VITE_CONVEX_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
