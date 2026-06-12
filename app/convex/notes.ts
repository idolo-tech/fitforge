/* FitForge — notes de séance / carnet (une note par jour), rattachées au compte */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Crée / met à jour / supprime (texte vide) la note d'un jour. */
export const set = mutation({
  args: { iso: v.string(), text: v.string() },
  handler: async (ctx, { iso, text }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_user_iso", (q) => q.eq("userId", userId).eq("iso", iso))
      .unique();
    const trimmed = text.trim();
    if (existing) {
      if (trimmed) await ctx.db.patch(existing._id, { text: trimmed });
      else await ctx.db.delete(existing._id);
    } else if (trimmed) {
      await ctx.db.insert("notes", { userId, iso, text: trimmed });
    }
  },
});
