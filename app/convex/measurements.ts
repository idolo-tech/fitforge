/* FitForge — mensurations (équiv. addMeasurement, upsert par zone + date) */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    await ctx.db
      .query("measurements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect(),
});

export const add = mutation({
  args: {
    userId: v.string(),
    key: v.string(),
    date: v.string(),
    value: v.number(),
  },
  handler: async (ctx, { userId, key, date, value }) => {
    const existing = await ctx.db
      .query("measurements")
      .withIndex("by_user_key_date", (q) =>
        q.eq("userId", userId).eq("key", key).eq("date", date),
      )
      .unique();
    if (existing) await ctx.db.patch(existing._id, { value });
    else await ctx.db.insert("measurements", { userId, key, date, value });
  },
});
