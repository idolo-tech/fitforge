/* FitForge — séances loggées + dernières charges, rattachées au compte connecté */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

/** Toutes les séances du compte connecté. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Dernière charge saisie par exercice, sous forme de Record<exId, kg>. */
export const lastWeights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return {};
    const rows = await ctx.db
      .query("lastWeights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const out: Record<string, number> = {};
    for (const r of rows) out[r.exId] = r.weight;
    return out;
  },
});

/** Enregistre une séance (upsert par date) et met à jour les dernières charges. */
export const save = mutation({
  args: {
    iso: v.string(),
    dayId: v.string(),
    dayName: v.string(),
    finishedAt: v.string(),
    durationSec: v.number(),
    volume: v.number(),
    avgRir: v.number(),
    exercises: v.array(loggedExercise),
    prs: v.array(pr),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");

    // upsert de la séance (clé métier : userId + iso)
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_user_iso", (q) =>
        q.eq("userId", userId).eq("iso", args.iso),
      )
      .unique();
    if (existing) await ctx.db.patch(existing._id, args);
    else await ctx.db.insert("sessions", { userId, ...args });

    // met à jour la dernière charge saisie pour chaque exercice
    for (const ex of args.exercises) {
      let last: number | null = null;
      for (const st of ex.sets) if (st.weight != null) last = st.weight;
      if (last === null) continue;
      const lw = await ctx.db
        .query("lastWeights")
        .withIndex("by_user_ex", (q) =>
          q.eq("userId", userId).eq("exId", ex.id),
        )
        .unique();
      if (lw) await ctx.db.patch(lw._id, { weight: last });
      else
        await ctx.db.insert("lastWeights", { userId, exId: ex.id, weight: last });
    }
  },
});
