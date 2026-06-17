"use node";
/* FitForge — Coach IA : analyse les données + le programme et écrit les
   ajustements de poids dans le calque (table `plan`).
   LLM : Google Gemini direct (clé GOOGLE_GENERATIVE_AI_API_KEY, gratuite, sans CB).
   Swappable : remplacer `google(...)` par un autre provider AI SDK. */
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateObject, generateText } from "ai";
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
    // contexte de planning (assiduité + séances manquées) — pour adapter la reprise
    schedule: v.optional(
      v.object({
        todayIso: v.string(),
        currentWeek: v.number(),
        plannedToDate: v.number(),
        doneToDate: v.number(),
        missedCount: v.number(),
        missedRecent: v.array(v.object({ iso: v.string(), name: v.string() })),
        daysSinceLast: v.union(v.number(), v.null()),
      }),
    ),
  },
  handler: async (ctx, { catalog, schedule }): Promise<CoachReport> => {
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

    const scheduleLines = schedule
      ? [
          `Semaine ${schedule.currentWeek}/12 · date du jour ${schedule.todayIso}.`,
          `Assiduité : ${schedule.doneToDate}/${schedule.plannedToDate} séances faites à ce jour.`,
          schedule.missedCount > 0
            ? `Séances manquées : ${schedule.missedCount}${schedule.missedRecent.length ? ` (récentes : ${schedule.missedRecent.map((m) => `${m.name} (${m.iso})`).join(", ")})` : ""}.`
            : "Aucune séance manquée — bonne régularité.",
          schedule.daysSinceLast != null
            ? `Dernière séance il y a ${schedule.daysSinceLast} jour(s).`
            : "Aucune séance enregistrée pour l'instant.",
        ].join("\n")
      : "Planning non fourni.";

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
      model: google("gemini-3.5-flash"),
      schema,
      system:
        "Tu es un coach de musculation expert et prudent. Tu ajustes UNIQUEMENT les poids cibles d'un programme existant (jamais la structure). Surcharge progressive : si l'utilisateur termine ses séries en RIR >= 2 plusieurs fois, augmente légèrement (2,5 kg sur les petits mouvements, 5 kg sur les gros). Si RIR 0-1 ou échec, ne monte pas (maintien ou légère baisse). Prends en compte les notes (douleurs, fatigue, sommeil) pour la sécurité : propose un maintien/deload en cas de surmenage. Tiens compte de l'assiduité : si l'utilisateur a manqué plusieurs séances ou repris après une coupure (dernière séance il y a >= 7 jours), NE POUSSE PAS les charges — propose un maintien ou un léger deload pour une reprise prudente, et explique cette reprise dans le résumé. Signale dans 'alerts' une perte de régularité si elle est marquée. N'ajuste que les exercices avec assez d'historique. Utilise l'exId EXACT. Réponds en français.",
      prompt: `Exercices (objectifs de reps + historique récent) :\n${exerciseLines}\n\nNotes de séance récentes :\n${noteLines}\n\nPlanning / assiduité :\n${scheduleLines}\n\nAnalyse et propose les ajustements de poids pour les prochaines séances. Adapte la reprise au contexte d'assiduité ci-dessus et résume en 1-2 phrases (mentionne les séances manquées / la reprise si pertinent).`,
    });

    // écrit les ajustements valides dans le calque
    const valid = object.adjustments.filter(
      (a) => catalog.some((c) => c.exId === a.exId) && Number.isFinite(a.targetWeight) && a.targetWeight > 0,
    );
    for (const a of valid) {
      await ctx.runMutation(api.plan.set, { exId: a.exId, targetWeight: a.targetWeight, reason: a.reason });
    }
    // persiste le rapport (affiché dans le Coach, y compris pour les runs auto)
    await ctx.runMutation(api.coach.saveReport, {
      summary: object.summary,
      alerts: object.alerts,
      adjustments: valid,
    });

    return { adjustments: valid, alerts: object.alerts, summary: object.summary };
  },
});

// ---------- coach conversationnel (chat, lecture seule) ----------
export const chatCoach = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
    catalog: v.array(
      v.object({ exId: v.string(), name: v.string(), muscle: v.string(), reps: v.string() }),
    ),
    schedule: v.optional(
      v.object({
        todayIso: v.string(),
        currentWeek: v.number(),
        plannedToDate: v.number(),
        doneToDate: v.number(),
        missedCount: v.number(),
        missedRecent: v.array(v.object({ iso: v.string(), name: v.string() })),
        daysSinceLast: v.union(v.number(), v.null()),
      }),
    ),
  },
  handler: async (ctx, { messages, catalog, schedule }): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non authentifié");

    const sessions = await ctx.runQuery(api.sessions.list, {});
    const lastWeights = await ctx.runQuery(api.sessions.lastWeights, {});
    const notes = await ctx.runQuery(api.notes.list, {});
    const plan = await ctx.runQuery(api.plan.list, {});

    const exerciseLines = catalog
      .map((e) => {
        const last = lastWeights[e.exId];
        const presc = plan.find((p) => p.exId === e.exId);
        return `- ${e.name} (${e.muscle}, objectif ${e.reps}) : dernière ${last ?? "?"} kg${presc ? `, cible coach ${presc.targetWeight} kg` : ""}`;
      })
      .join("\n");

    const recentNotes =
      [...notes].sort((a, b) => a.iso.localeCompare(b.iso)).slice(-5).map((n) => `${n.iso}: ${n.text}`).join(" ; ") || "aucune";

    const sched = schedule
      ? `Semaine ${schedule.currentWeek}/12 · ${schedule.doneToDate}/${schedule.plannedToDate} séances faites · ${schedule.missedCount} manquée(s)` +
        (schedule.daysSinceLast != null ? ` · dernière il y a ${schedule.daysSinceLast} j.` : ".")
      : "";

    const system =
      "Tu es le coach IA de FitForge, une app de musculation (programme 12 semaines « Carrure + Définition », 4 séances/semaine). " +
      "Réponds en français, de façon concise, concrète et bienveillante. Tu peux conseiller sur l'entraînement, la technique, la nutrition, la récupération, proposer des charges ou des alternatives d'exercices. " +
      "Tu NE modifies PAS le programme toi-même (tu peux le recommander, l'utilisateur a un bouton « Adapter »). Reste dans le périmètre fitness/musculation ; si on te demande autre chose, recentre poliment.\n\n" +
      `Contexte de l'utilisateur :\n- Séances loggées : ${sessions.length}. ${sched}\n- Exercices (charges) :\n${exerciseLines}\n- Notes récentes : ${recentNotes}`;

    const { text } = await generateText({
      model: google("gemini-3.5-flash"),
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return text;
  },
});
