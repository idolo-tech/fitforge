/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as body from "../body.js";
import type * as coach from "../coach.js";
import type * as gym from "../gym.js";
import type * as http from "../http.js";
import type * as measurements from "../measurements.js";
import type * as notes from "../notes.js";
import type * as photos from "../photos.js";
import type * as plan from "../plan.js";
import type * as profile from "../profile.js";
import type * as sessions from "../sessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  body: typeof body;
  coach: typeof coach;
  gym: typeof gym;
  http: typeof http;
  measurements: typeof measurements;
  notes: typeof notes;
  photos: typeof photos;
  plan: typeof plan;
  profile: typeof profile;
  sessions: typeof sessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
