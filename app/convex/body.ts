/* FitForge — poids corporel (upsert par date), rattaché au compte connecté */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("bodyWeights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const add = mutation({
  args: { date: v.string(), value: v.number() },
  handler: async (ctx, { date, value }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const existing = await ctx.db
      .query("bodyWeights")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { value });
    else await ctx.db.insert("bodyWeights", { userId, date, value });
  },
});
