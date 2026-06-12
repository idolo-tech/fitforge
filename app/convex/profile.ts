/* FitForge — profil utilisateur (lecture + upsert) */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    weight: v.number(),
    height: v.number(),
    goal: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("profiles", args);
  },
});
