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
    // Clear existing to avoid duplicates
    const oldGovs = await ctx.db.query("governorates").collect();
    for (const og of oldGovs) await ctx.db.delete(og._id);
    const oldDistricts = await ctx.db.query("districts").collect();
    for (const od of oldDistricts) await ctx.db.delete(od._id);
    const oldPartners = await ctx.db.query("partners").collect();
    for (const op of oldPartners) await ctx.db.delete(op._id);

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

    const districts = [
      { gov: "BEI", nameEn: "Beirut", nameAr: "بيروت", code: "BEI" },
      // Mount Lebanon
      { gov: "ML", nameEn: "Baabda", nameAr: "بعبدا", code: "BAA" },
      { gov: "ML", nameEn: "Matn", nameAr: "المتن", code: "MAT" },
      { gov: "ML", nameEn: "Shouf", nameAr: "الشوف", code: "SHO" },
      { gov: "ML", nameEn: "Aley", nameAr: "عاليه", code: "ALE" },
      { gov: "ML", nameEn: "Keserwan", nameAr: "كسروان", code: "KES" },
      { gov: "ML", nameEn: "Jbeil", nameAr: "جبيل", code: "JBE" },
      // North
      { gov: "NOR", nameEn: "Tripoli", nameAr: "طرابلس", code: "TRI" },
      { gov: "NOR", nameEn: "Koura", nameAr: "الكورة", code: "KOU" },
      { gov: "NOR", nameEn: "Zgharta", nameAr: "زغرتا", code: "ZGH" },
      { gov: "NOR", nameEn: "Batroun", nameAr: "البترون", code: "BAT" },
      { gov: "NOR", nameEn: "Bsharri", nameAr: "بشري", code: "BSH" },
      { gov: "NOR", nameEn: "Minieh-Danniyeh", nameAr: "المنية - الضنية", code: "MIN" },
      // Akkar
      { gov: "AKK", nameEn: "Akkar", nameAr: "عكار", code: "AKK" },
      // Bekaa
      { gov: "BEK", nameEn: "Zahle", nameAr: "زحلة", code: "ZAH" },
      { gov: "BEK", nameEn: "West Bekaa", nameAr: "البقاع الغربي", code: "WBE" },
      { gov: "BEK", nameEn: "Rashaya", nameAr: "راشيا", code: "RAS" },
      // Baalbek-Hermel
      { gov: "BH", nameEn: "Baalbek", nameAr: "بعلبك", code: "BAA_BH" },
      { gov: "BH", nameEn: "Hermel", nameAr: "الهرمل", code: "HER" },
      // South
      { gov: "SOU", nameEn: "Sidon", nameAr: "صيدا", code: "SID" },
      { gov: "SOU", nameEn: "Tyre", nameAr: "صور", code: "TYR" },
      { gov: "SOU", nameEn: "Jezzine", nameAr: "جزين", code: "JEZ" },
      // El Nabatieh
      { gov: "NAB", nameEn: "Nabatieh", nameAr: "النبطية", code: "NAB_DIST" },
      { gov: "NAB", nameEn: "Marjeyoun", nameAr: "مرجعيون", code: "MAR" },
      { gov: "NAB", nameEn: "Hasbaya", nameAr: "حاصبيا", code: "HAS" },
      { gov: "NAB", nameEn: "Bint Jbeil", nameAr: "بنت جبيل", code: "BIN" },
    ];

    for (const d of districts) {
      await ctx.db.insert("districts", {
        governorateId: govIds[d.gov],
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        code: d.code
      });
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

    // Default Admin User
    await ctx.db.insert("users", {
      name: "John Doe",
      email: "john@emergency-ops.lb",
      role: "admin",
      status: "active"
    });

    return "Seeding completed successfully with Governorates, Districts, Partners, and Admin User";
  },
});
