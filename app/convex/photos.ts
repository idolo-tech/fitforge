/* FitForge — photos de progression (Convex File Storage), rattachées au compte */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** URL d'upload courte durée : le client POST le fichier dessus. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Enregistre une photo après upload (remplace celle du même angle/jour). */
export const save = mutation({
  args: { storageId: v.id("_storage"), angle: v.string(), date: v.string() },
  handler: async (ctx, { storageId, angle, date }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const sameAngle = await ctx.db
      .query("photos")
      .withIndex("by_user_angle", (q) => q.eq("userId", userId).eq("angle", angle))
      .collect();
    for (const p of sameAngle) {
      if (p.date === date) {
        await ctx.storage.delete(p.storageId);
        await ctx.db.delete(p._id);
      }
    }
    await ctx.db.insert("photos", { userId, angle, date, storageId });
  },
});

/** Liste les photos du compte avec leurs URLs servables. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("photos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return Promise.all(
      rows.map(async (r) => ({
        id: r._id,
        angle: r.angle,
        date: r.date,
        url: await ctx.storage.getUrl(r.storageId),
      })),
    );
  },
});

/** Supprime une photo (fichier + ligne). */
export const remove = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) return;
    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(id);
  },
});
