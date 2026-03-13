import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addMMUUpdate = mutation({
  args: {
    facilityId: v.id("facilities"),
    reportingUser: v.id("users"),
    caseManagement: v.boolean(),
    pssActivities: v.boolean(),
    capacity: v.number(),
    currentCases: v.number(),
    outreachTeams: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const id = await ctx.db.insert("mmu_updates", {
      ...args,
      timestamp,
    });

    // Update the facility's updatedAt field
    await ctx.db.patch(args.facilityId, {
      updatedAt: timestamp,
    });

    return id;
  },
});

export const getLatestMMUUpdates = query({
  args: {},
  handler: async (ctx) => {
    const facilities = await ctx.db
      .query("facilities")
      .filter((q) => q.eq(q.field("type"), "MMU"))
      .collect();

    // Also get facilities that might not be type "MMU" but have "Protection" or "Health" in sectors
    // Since MMUs are Medical, they might relate to Health too
    const relevantSectoredFacilities = await ctx.db
      .query("facilities")
      .filter((q) => 
        q.and(
          q.neq(q.field("type"), "MMU"),
          q.neq(q.field("sectors"), undefined)
        )
      )
      .collect();
    
    const allRelevantFacilities = [
      ...facilities,
      ...relevantSectoredFacilities.filter(f => f.sectors?.includes("Protection") || f.sectors?.includes("Health"))
    ];

    const updates = await Promise.all(
      allRelevantFacilities.map(async (facility) => {
        const lastUpdate = await ctx.db
          .query("mmu_updates")
          .withIndex("by_facility", (q) => q.eq("facilityId", facility._id))
          .order("desc")
          .first();
        return lastUpdate;
      })
    );

    return updates.filter((u) => u !== null);
  },
});

export const getMMUStats = query({
  args: {},
  handler: async (ctx) => {
    const mmus = await ctx.db
      .query("facilities")
      .filter((q) => q.eq(q.field("type"), "MMU"))
      .collect();

    const updates = await Promise.all(
      mmus.map(async (mmu) => {
        return await ctx.db
          .query("mmu_updates")
          .withIndex("by_facility", (q) => q.eq("facilityId", mmu._id))
          .order("desc")
          .first();
      })
    );

    const validUpdates = updates.filter((u) => u !== null);
    const totalCapacity = validUpdates.reduce((acc, curr) => acc + curr!.capacity, 0);
    const currentCases = validUpdates.reduce((acc, curr) => acc + curr!.currentCases, 0);
    const totalOutreachTeams = validUpdates.reduce((acc, curr) => acc + curr!.outreachTeams, 0);

    return {
      activeMMUs: mmus.length,
      totalCapacity,
      currentCases,
      totalOutreachTeams,
    };
  },
});
