/* FitForge — scans de salle : machines détectées par l'IA vision, rattachés au compte.
   L'image scannée est conservée (File Storage) pour l'historique « ma salle ». */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const scanMachine = v.object({
  name: v.string(),
  confidence: v.number(),
  muscles: v.array(v.string()),
  exercises: v.array(
    v.object({
      exId: v.optional(v.string()),
      name: v.string(),
      howTo: v.string(),
      setsReps: v.optional(v.string()),
    }),
  ),
});

/** Enregistre un scan (appelé par l'action ai.analyzeGymPhoto). */
export const saveScan = mutation({
  args: {
    storageId: v.id("_storage"),
    summary: v.string(),
    machines: v.array(scanMachine),
  },
  handler: async (ctx, { storageId, summary, machines }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    return await ctx.db.insert("gymScans", {
      userId,
      storageId,
      createdAt: new Date().toISOString(),
      summary,
      machines,
    });
  },
});

/** Historique « ma salle » : scans du compte (récents d'abord) avec URL d'image. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("gymScans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);
    return Promise.all(
      rows.map(async (r) => ({
        id: r._id,
        createdAt: r.createdAt,
        summary: r.summary,
        machines: r.machines,
        url: await ctx.storage.getUrl(r.storageId),
      })),
    );
  },
});

/** Supprime un scan (ligne + image). */
export const remove = mutation({
  args: { id: v.id("gymScans") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) return;
    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(id);
  },
});
