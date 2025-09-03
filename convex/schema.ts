import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  sessions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("tournament"), v.literal("cash")),
    date: v.number(),
    venue: v.string(),
    gameType: v.string(), // "NLH", "PLO", etc.
    stakes: v.string(), // "$1/$2", "$100 buy-in", etc.
    
    // Tournament specific
    buyIn: v.optional(v.number()),
    rebuyCount: v.optional(v.number()),
    rebuyAmount: v.optional(v.number()),
    addOnCount: v.optional(v.number()),
    addOnAmount: v.optional(v.number()),
    position: v.optional(v.number()),
    totalEntrants: v.optional(v.number()),
    prize: v.optional(v.number()),
    
    // Cash game specific
    buyInAmount: v.optional(v.number()),
    cashOut: v.optional(v.number()),
    duration: v.optional(v.number()), // in minutes
    
    // Common fields
    profit: v.number(), // net profit/loss
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_type", ["userId", "type"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
