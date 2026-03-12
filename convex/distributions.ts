import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDistributions = query({
  handler: async (ctx) => {
    return await ctx.db.query("distributions").order("desc").collect();
  },
});

export const addDistribution = mutation({
  args: {
    campaignName: v.string(),
    facilityId: v.id("facilities"),
    partnerId: v.id("partners"),
    itemType: v.string(),
    quantity: v.number(),
    householdsReached: v.number(),
    beneficiariesReached: v.number(),
    date: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("distributions", args);
  },
});
