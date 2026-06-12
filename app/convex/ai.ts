"use node";
/* FitForge — Coach IA : analyse les données + le programme et écrit les
   ajustements de poids dans le calque (table `plan`).
   LLM : Google Gemini direct (clé GOOGLE_GENERATIVE_AI_API_KEY, gratuite, sans CB).
   Swappable : remplacer `google(...)` par un autre provider AI SDK. */
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { v } from "convex/values";

interface Adjustment { exId: string; targetWeight: number; reason: string; }
interface CoachReport { adjustments: Adjustment[]; alerts: string[]; summary: string; }

export const adaptProgram = action({
  args: {
    // catalogue des exercices à charge (depuis program.ts, côté front)
    catalog: v.array(
      v.object({
        exId: v.string(),
        name: v.string(),
        muscle: v.string(),
        reps: v.string(),
      }),
    ),
  },
  handler: async (ctx, { catalog }): Promise<CoachReport> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");

    // données loggées (l'auth se propage aux runQuery)
    const sessions = await ctx.runQuery(api.sessions.list, {});
    const lastWeights = await ctx.runQuery(api.sessions.lastWeights, {});
    const notes = await ctx.runQuery(api.notes.list, {});

    // historique compact par exercice
    const byEx: Record<string, string[]> = {};
    for (const s of [...sessions].sort((a, b) => a.iso.localeCompare(b.iso))) {
      for (const ex of s.exercises) {
        (byEx[ex.id] ||= []);
        for (const st of ex.sets) {
          byEx[ex.id].push(`${s.iso}:${st.weight ?? "?"}kg×${st.reps}@RIR${st.rir}`);
        }
      }
    }

    const exerciseLines = catalog
      .map((e) => {
        const hist = (byEx[e.exId] || []).slice(-10).join(", ") || "aucun historique";
        const last = lastWeights[e.exId];
        return `- exId="${e.exId}" "${e.name}" (${e.muscle}, objectif ${e.reps} reps) · dernière charge: ${last ?? "?"} kg · séries récentes: ${hist}`;
      })
      .join("\n");

    const noteLines =
      [...notes]
        .sort((a, b) => a.iso.localeCompare(b.iso))
        .slice(-10)
        .map((n) => `${n.iso}: ${n.text}`)
        .join("\n") || "aucune note";

    const schema = z.object({
      adjustments: z
        .array(
          z.object({
            exId: z.string().describe("exId EXACT de l'exercice (depuis la liste)"),
            targetWeight: z.number().describe("poids cible prescrit, en kg"),
            reason: z.string().describe("raison courte, en français"),
          }),
        )
        .describe("uniquement les exercices à ajuster"),
      alerts: z
        .array(z.string())
        .describe("alertes en français : surmenage, douleur récurrente, stagnation"),
      summary: z.string().describe("résumé coach en 1-2 phrases, en français"),
    });

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema,
      system:
        "Tu es un coach de musculation expert et prudent. Tu ajustes UNIQUEMENT les poids cibles d'un programme existant (jamais la structure). Surcharge progressive : si l'utilisateur termine ses séries en RIR >= 2 plusieurs fois, augmente légèrement (2,5 kg sur les petits mouvements, 5 kg sur les gros). Si RIR 0-1 ou échec, ne monte pas (maintien ou légère baisse). Prends en compte les notes (douleurs, fatigue, sommeil) pour la sécurité : propose un maintien/deload en cas de surmenage. N'ajuste que les exercices avec assez d'historique. Utilise l'exId EXACT. Réponds en français.",
      prompt: `Exercices (objectifs de reps + historique récent) :\n${exerciseLines}\n\nNotes de séance récentes :\n${noteLines}\n\nAnalyse et propose les ajustements de poids pour les prochaines séances.`,
    });

    // écrit les ajustements valides dans le calque
    const valid = object.adjustments.filter(
      (a) => catalog.some((c) => c.exId === a.exId) && Number.isFinite(a.targetWeight) && a.targetWeight > 0,
    );
    for (const a of valid) {
      await ctx.runMutation(api.plan.set, { exId: a.exId, targetWeight: a.targetWeight, reason: a.reason });
    }

    return { adjustments: valid, alerts: object.alerts, summary: object.summary };
  },
});
