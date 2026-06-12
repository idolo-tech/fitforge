/* FitForge — calque d'ajustements (prescriptions de poids par exercice).
   Écrit par l'IA (Phase 3) ; lu par l'app. Vide = programme de base respecté. */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("plan")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Pose / met à jour une prescription pour un exercice. */
export const set = mutation({
  args: { exId: v.string(), targetWeight: v.number(), reason: v.optional(v.string()) },
  handler: async (ctx, { exId, targetWeight, reason }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const existing = await ctx.db
      .query("plan")
      .withIndex("by_user_ex", (q) => q.eq("userId", userId).eq("exId", exId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { targetWeight, reason });
    else await ctx.db.insert("plan", { userId, exId, targetWeight, reason });
  },
});

/** Retire la prescription d'un exercice (retour au programme de base). */
export const clear = mutation({
  args: { exId: v.string() },
  handler: async (ctx, { exId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const existing = await ctx.db
      .query("plan")
      .withIndex("by_user_ex", (q) => q.eq("userId", userId).eq("exId", exId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
