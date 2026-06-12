/* FitForge — mensurations (upsert par zone + date), rattachées au compte connecté */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("measurements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    key: v.string(),
    date: v.string(),
    value: v.number(),
  },
  handler: async (ctx, { key, date, value }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
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
