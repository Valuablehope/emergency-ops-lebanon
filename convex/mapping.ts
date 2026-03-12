import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDangerZones = query({
  handler: async (ctx) => {
    return await ctx.db.query("danger_zones").collect();
  },
});

export const addDangerZone = mutation({
  args: {
    name: v.string(),
    geometry: v.any(),
    riskLevel: v.string(),
    validFrom: v.number(),
    validTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("danger_zones", args);
  },
});
