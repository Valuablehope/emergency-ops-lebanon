import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // "admin", "manager", "entry", "viewer"
    areaId: v.optional(v.string()), // Area-based scoping
    status: v.string(), // "active", "suspended"
  }).index("by_email", ["email"]),

  governorates: defineTable({
    nameEn: v.string(),
    nameAr: v.string(),
    code: v.string(),
  }).index("by_code", ["code"]),

  districts: defineTable({
    governorateId: v.id("governorates"),
    nameEn: v.string(),
    nameAr: v.string(),
    code: v.string(),
  }).index("by_gov", ["governorateId"]),

  municipalities: defineTable({
    districtId: v.id("districts"),
    nameEn: v.string(),
    nameAr: v.string(),
    code: v.string(),
  }).index("by_district", ["districtId"]),

  partners: defineTable({
    name: v.string(),
    acronym: v.string(),
    type: v.string(), // "INGO", "NGO", "UN", "Gov"
  }),

  facilities: defineTable({
    code: v.string(),
    name: v.string(),
    type: v.string(), // "PHCC", "Hospital", "Shelter", "CMR", "PSU"
    subType: v.string(),
    partnerId: v.id("partners"),
    governorateId: v.id("governorates"),
    districtId: v.id("districts"),
    municipalityId: v.optional(v.id("municipalities")),
    lat: v.number(),
    lng: v.number(),
    status: v.string(), // "active", "inactive", "closed"
    sectors: v.optional(v.array(v.string())), // "WASH", "Health", "Protection", etc.
    specialties: v.optional(v.array(v.string())), // Medical specialties like "Pediatrics", "Trauma"
    updatedAt: v.number(),
  }).index("by_type", ["type"]).index("by_gov", ["governorateId"]),

  shelter_updates: defineTable({
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
    timestamp: v.number(),
  }).index("by_facility", ["facilityId"]),

  distributions: defineTable({
    campaignName: v.string(),
    facilityId: v.id("facilities"),
    partnerId: v.id("partners"),
    itemType: v.string(),
    quantity: v.number(),
    householdsReached: v.number(),
    beneficiariesReached: v.number(),
    date: v.number(),
    status: v.string(), // "planned", "completed"
  }),

  danger_zones: defineTable({
    name: v.string(),
    geometry: v.any(), // GeoJSON
    riskLevel: v.string(), // "high", "medium", "low"
    validFrom: v.number(),
    validTo: v.optional(v.number()),
  }),

  audit_logs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    details: v.string(),
    timestamp: v.number(),
  }),
});
