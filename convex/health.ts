import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getHealthStats = query({
  handler: async (ctx) => {
    const facilities = await ctx.db.query("facilities").collect();
    const phccs = facilities.filter(f => f.type === "PHCC");
    const hospitals = facilities.filter(f => f.type === "Hospital");
    
    return {
      totalPHCCs: phccs.length,
      activePHCCs: phccs.filter(f => f.status === "active").length,
      totalHospitals: hospitals.length,
      activeHospitals: hospitals.filter(f => f.status === "active").length,
    };
  },
});
