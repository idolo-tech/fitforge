/* ============================================================
   FitForge — schéma Convex
   Reflète fidèlement le modèle de données local (src/data/store.ts) :
   sessions, poids corporel, mensurations, dernières charges, profil.
   Chaque ligne est rattachée à un `userId` (string) → prêt pour le
   multi-appareil / l'auth plus tard. L'app locale utilise un id d'appareil.
   ============================================================ */
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// sous-objets (cf. LoggedSession dans src/data/store.ts)
const loggedSet = v.object({
  weight: v.union(v.number(), v.null()),
  reps: v.number(),
  rir: v.number(),
});
const loggedExercise = v.object({
  id: v.string(),
  name: v.string(),
  sets: v.array(loggedSet),
});
const pr = v.object({
  exercise: v.string(),
  prev: v.number(),
  next: v.number(),
});

export default defineSchema({
  // tables d'authentification (@convex-dev/auth) : users, authSessions, etc.
  ...authTables,

  // profil utilisateur (équiv. localStorage `fitforge_profile`)
  // userId = id du compte (users._id), stocké en string pour compat données.
  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    weight: v.number(),
    height: v.number(),
    goal: v.string(),
  }).index("by_user", ["userId"]),

  // séances loggées (clé métier : userId + iso de la date)
  sessions: defineTable({
    userId: v.string(),
    iso: v.string(),
    dayId: v.string(),
    dayName: v.string(),
    finishedAt: v.string(),
    durationSec: v.number(),
    volume: v.number(),
    avgRir: v.number(),
    exercises: v.array(loggedExercise),
    prs: v.array(pr),
  })
    .index("by_user", ["userId"])
    .index("by_user_iso", ["userId", "iso"]),

  // relevés de poids corporel
  bodyWeights: defineTable({
    userId: v.string(),
    date: v.string(),
    value: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // mensurations (par zone : shoulders, chest, arms, waist, thighs, calves)
  measurements: defineTable({
    userId: v.string(),
    key: v.string(),
    date: v.string(),
    value: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_key", ["userId", "key"])
    .index("by_user_key_date", ["userId", "key", "date"]),

  // dernière charge saisie par exercice (prefill pendant la séance)
  lastWeights: defineTable({
    userId: v.string(),
    exId: v.string(),
    weight: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_ex", ["userId", "exId"]),

  // photos de progression (Convex File Storage)
  photos: defineTable({
    userId: v.string(),
    angle: v.string(),            // 'face' | 'left' | 'right' | 'back'
    date: v.string(),             // ISO date
    storageId: v.id("_storage"),
  })
    .index("by_user", ["userId"])
    .index("by_user_angle", ["userId", "angle"]),

  // notes de séance / carnet (une note par jour, clé = iso)
  notes: defineTable({
    userId: v.string(),
    iso: v.string(),
    text: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_iso", ["userId", "iso"]),

  // calque d'ajustements : prescriptions de poids par exercice (écrit par l'IA).
  // VIDE par défaut → le programme de base (program.ts) est respecté.
  plan: defineTable({
    userId: v.string(),
    exId: v.string(),
    targetWeight: v.number(),
    reason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_ex", ["userId", "exId"]),

  // rapports du Coach IA (historique des adaptations, le dernier est affiché)
  coachReports: defineTable({
    userId: v.string(),
    summary: v.string(),
    alerts: v.array(v.string()),
    adjustments: v.array(
      v.object({ exId: v.string(), targetWeight: v.number(), reason: v.string() }),
    ),
  }).index("by_user", ["userId"]),
});
