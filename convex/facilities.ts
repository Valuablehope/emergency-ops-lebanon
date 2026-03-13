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
    municipalityId: v.optional(v.id("municipalities")),
    lat: v.number(),
    lng: v.number(),
    status: v.string(),
    sectors: v.optional(v.array(v.string())),
    specialties: v.optional(v.array(v.string())),
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
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    subType: v.optional(v.string()),
    partnerId: v.optional(v.id("partners")),
    governorateId: v.optional(v.id("governorates")),
    districtId: v.optional(v.id("districts")),
    municipalityId: v.optional(v.id("municipalities")),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    status: v.optional(v.string()),
    sectors: v.optional(v.array(v.string())),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteFacility = mutation({
  args: { id: v.id("facilities") },
  handler: async (ctx, args) => {
    // Check for dependent data (e.g. shelter updates)
    const updates = await ctx.db
      .query("shelter_updates")
      .withIndex("by_facility", (q) => q.eq("facilityId", args.id))
      .collect();
    
    for (const update of updates) {
      await ctx.db.delete(update._id);
    }

    const distributions = await ctx.db
      .query("distributions")
      .filter(q => q.eq(q.field("facilityId"), args.id))
      .collect();

    for (const d of distributions) {
      await ctx.db.delete(d._id);
    }

    await ctx.db.delete(args.id);
  },
});
