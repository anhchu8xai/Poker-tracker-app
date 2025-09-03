import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSession = mutation({
  args: {
    type: v.union(v.literal("tournament"), v.literal("cash")),
    date: v.number(),
    venue: v.string(),
    gameType: v.string(),
    stakes: v.string(),
    buyIn: v.optional(v.number()),
    rebuyCount: v.optional(v.number()),
    rebuyAmount: v.optional(v.number()),
    addOnCount: v.optional(v.number()),
    addOnAmount: v.optional(v.number()),
    position: v.optional(v.number()),
    totalEntrants: v.optional(v.number()),
    prize: v.optional(v.number()),
    buyInAmount: v.optional(v.number()),
    cashOut: v.optional(v.number()),
    duration: v.optional(v.number()),
    profit: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("sessions", {
      userId,
      ...args,
    });
  },
});

export const getSessions = query({
  args: {
    type: v.optional(v.union(v.literal("tournament"), v.literal("cash"))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    const sessions = await query.collect();

    return sessions
      .filter((session) => {
        if (args.type && session.type !== args.type) return false;
        if (args.startDate && session.date < args.startDate) return false;
        if (args.endDate && session.date > args.endDate) return false;
        return true;
      })
      .sort((a, b) => b.date - a.date);
  },
});

export const getStats = query({
  args: {
    type: v.optional(v.union(v.literal("tournament"), v.literal("cash"))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const filteredSessions = sessions.filter((session) => {
      if (args.type && session.type !== args.type) return false;
      if (args.startDate && session.date < args.startDate) return false;
      if (args.endDate && session.date > args.endDate) return false;
      return true;
    });

    if (filteredSessions.length === 0) {
      return {
        totalProfit: 0,
        totalSessions: 0,
        winRate: 0,
        avgProfit: 0,
        totalHours: 0,
        hourlyRate: 0,
        bestSession: 0,
        worstSession: 0,
      };
    }

    const totalProfit = filteredSessions.reduce((sum, s) => sum + s.profit, 0);
    const totalSessions = filteredSessions.length;
    const winningSessions = filteredSessions.filter((s) => s.profit > 0).length;
    const winRate = (winningSessions / totalSessions) * 100;
    const avgProfit = totalProfit / totalSessions;
    
    const totalHours = filteredSessions
      .filter((s) => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    
    const hourlyRate = totalHours > 0 ? totalProfit / totalHours : 0;
    
    const profits = filteredSessions.map((s) => s.profit);
    const bestSession = Math.max(...profits);
    const worstSession = Math.min(...profits);

    return {
      totalProfit,
      totalSessions,
      winRate,
      avgProfit,
      totalHours,
      hourlyRate,
      bestSession,
      worstSession,
    };
  },
});

export const deleteSession = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
