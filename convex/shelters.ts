import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLatestShelterUpdates = query({
  handler: async (ctx) => {
    const updates = await ctx.db.query("shelter_updates").order("desc").collect();
    // Return unique per facility
    const latest = new Map();
    for (const update of updates) {
      if (!latest.has(update.facilityId)) {
        latest.set(update.facilityId, update);
      }
    }
    return Array.from(latest.values());
  },
});

export const addShelterUpdate = mutation({
  args: {
    facilityId: v.id("facilities"),
    reportingUser: v.id("users"),
    occupancy: v.number(),
    capacity: v.number(),
    femaleCount: v.number(),
    maleCount: v.number(),
    childrenCount: v.number(),
    elderlyCount: v.number(),
    pwdCount: v.number(),
    washStatus: v.string(),
    infrastructureStatus: v.string(),
    protectionIssues: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shelter_updates", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
