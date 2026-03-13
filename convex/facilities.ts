import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFacilities = query({
  args: { 
    type: v.optional(v.string()) ,
    governorateId: v.optional(v.id("governorates")),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("facilities")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    
    if (args.governorateId) {
      return await ctx.db
        .query("facilities")
        .withIndex("by_gov", (q) => q.eq("governorateId", args.governorateId!))
        .collect();
    }
    
    return await ctx.db.query("facilities").collect();
  },
});

export const getFacilityById = query({
  args: { facilityId: v.id("facilities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.facilityId);
  },
});

export const createFacility = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    type: v.string(),
    subType: v.string(),
    partnerId: v.id("partners"),
    governorateId: v.id("governorates"),
    districtId: v.id("districts"),
    municipalityId: v.id("municipalities"),
    lat: v.number(),
    lng: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("facilities", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const updateFacility = mutation({
  args: {
    id: v.id("facilities"),
    name: v.optional(v.string()),
    status: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
