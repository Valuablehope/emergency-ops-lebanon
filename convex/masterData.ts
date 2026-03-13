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
// Seed initial data
export const seed = mutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existingGov = await ctx.db.query("governorates").first();
    if (existingGov) return "Already seeded";

    const govs = [
      { nameEn: "Beirut", nameAr: "بيروت", code: "BEI" },
      { nameEn: "Mount Lebanon", nameAr: "جبل لبنان", code: "ML" },
      { nameEn: "North", nameAr: "الشمال", code: "NOR" },
      { nameEn: "Akkar", nameAr: "عكار", code: "AKK" },
      { nameEn: "Bekaa", nameAr: "البقاع", code: "BEK" },
      { nameEn: "Baalbek-Hermel", nameAr: "بعلبك - الهرمل", code: "BH" },
      { nameEn: "South", nameAr: "الجنوب", code: "SOU" },
      { nameEn: "El Nabatieh", nameAr: "النبطية", code: "NAB" },
    ];

    const govIds: Record<string, any> = {};
    for (const g of govs) {
      govIds[g.code] = await ctx.db.insert("governorates", g);
    }

    const partners = [
      { name: "Lebanese Red Cross", acronym: "LRC", type: "Gov" },
      { name: "UNHCR Lebanon", acronym: "UNHCR", type: "UN" },
      { name: "International Medical Corps", acronym: "IMC", type: "INGO" },
      { name: "UNICEF Lebanon", acronym: "UNICEF", type: "UN" },
      { name: "World Food Programme", acronym: "WFP", type: "UN" },
    ];

    for (const p of partners) {
      await ctx.db.insert("partners", p);
    }

    return "Seeding completed successfully";
  },
});
