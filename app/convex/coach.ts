/* FitForge — rapports du Coach IA : lecture du dernier + écriture (par l'action IA). */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Le dernier rapport généré (auto ou manuel), ou null. */
export const latestReport = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("coachReports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

/** Enregistre un rapport (appelé par l'action ai.adaptProgram). */
export const saveReport = mutation({
  args: {
    summary: v.string(),
    alerts: v.array(v.string()),
    adjustments: v.array(
      v.object({ exId: v.string(), targetWeight: v.number(), reason: v.string() }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    await ctx.db.insert("coachReports", { userId, ...args });
  },
});
