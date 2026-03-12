import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Governorates
export const getGovernorates = query({
  handler: async (ctx) => {
    return await ctx.db.query("governorates").collect();
  },
});

export const addGovernorate = mutation({
  args: { nameEn: v.string(), nameAr: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("governorates", args);
  },
});

// Districts
export const getDistricts = query({
  args: { governorateId: v.optional(v.id("governorates")) },
  handler: async (ctx, args) => {
    if (args.governorateId) {
      return await ctx.db
        .query("districts")
        .withIndex("by_gov", (q) => q.eq("governorateId", args.governorateId!))
        .collect();
    }
    return await ctx.db.query("districts").collect();
  },
});

export const addDistrict = mutation({
  args: { 
    governorateId: v.id("governorates"), 
    nameEn: v.string(), 
    nameAr: v.string(), 
    code: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("districts", args);
  },
});

// Partners
export const getPartners = query({
  handler: async (ctx) => {
    return await ctx.db.query("partners").collect();
  },
});

export const addPartner = mutation({
  args: { name: v.string(), acronym: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("partners", args);
  },
});

// Municipalities
export const getMunicipalities = query({
  args: { districtId: v.optional(v.id("districts")) },
  handler: async (ctx, args) => {
    if (args.districtId) {
      return await ctx.db
        .query("municipalities")
        .withIndex("by_district", (q) => q.eq("districtId", args.districtId!))
        .collect();
    }
    return await ctx.db.query("municipalities").collect();
  },
});

export const addMunicipality = mutation({
  args: { 
    districtId: v.id("districts"), 
    nameEn: v.string(), 
    nameAr: v.string(), 
    code: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("municipalities", args);
  },
});
