/* FitForge — poids corporel (équiv. addBodyWeight, upsert par date) */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("bodyWeights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const add = mutation({
  args: { userId: v.string(), date: v.string(), value: v.number() },
  handler: async (ctx, { userId, date, value }) => {
    const existing = await ctx.db
      .query("bodyWeights")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { value });
    else await ctx.db.insert("bodyWeights", { userId, date, value });
  },
});
