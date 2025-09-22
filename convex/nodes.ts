import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all nodes with their extras (optimized to avoid N+1 queries)
export const getAllNodes = query({
  args: {},
  handler: async (ctx) => {
    // First get all nodes
    const nodes = await ctx.db.query("nodes").collect();
    
    // Then get all extras in one query
    const allExtras = await ctx.db.query("nodes_extras").collect();
    
    // Group extras by node_id
    const extrasByNodeId = new Map();
    allExtras.forEach(extra => {
      if (!extrasByNodeId.has(extra.node_id)) {
        extrasByNodeId.set(extra.node_id, []);
      }
      extrasByNodeId.get(extra.node_id).push(extra);
    });
    
    // Combine nodes with their extras
    return nodes.map(node => ({
      ...node,
      nodes_extras: extrasByNodeId.get(node._id) || []
    }));
  },
});

// Get nodes by type (simplified for gallery - no extras needed)
export const getNodesByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();
  },
});

// Get recent nodes (simplified for gallery - no extras needed)
export const getRecentNodes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("is_recent"), true))
      .collect();
  },
});

// Get recent nodes with extras (for home page)
export const getRecentNodesWithExtras = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("is_recent"), true))
      .collect();
    
    if (nodes.length === 0) return [];
    
    // Get all extras for these nodes in one query
    const nodeIds = nodes.map(node => node._id);
    const allExtras = await ctx.db.query("nodes_extras").collect();
    const relevantExtras = allExtras.filter(extra => nodeIds.includes(extra.node_id));
    
    // Group extras by node_id
    const extrasByNodeId = new Map();
    relevantExtras.forEach(extra => {
      if (!extrasByNodeId.has(extra.node_id)) {
        extrasByNodeId.set(extra.node_id, []);
      }
      extrasByNodeId.get(extra.node_id).push(extra);
    });
    
    // Combine nodes with their extras
    return nodes.map(node => ({
      ...node,
      nodes_extras: extrasByNodeId.get(node._id) || []
    }));
  },
});

// Get single node by ID
export const getNodeById = query({
  args: { id: v.id("nodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) return null;
    
    const extras = await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), args.id))
      .collect();
    
    return { ...node, nodes_extras: extras };
  },
});

// Create a new node
export const createNode = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    index: v.optional(v.number()),
    is_recent: v.optional(v.boolean()),
    is_video: v.optional(v.boolean()),
    recent_work_date: v.optional(v.string()),
    technical: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("recent"),
      v.literal("photo"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("performance"),
      v.literal("installation"),
      v.literal("oil"),
      v.literal("drawing"),
      v.literal("abstract"),
      v.literal("digital"),
      v.literal("sculpture")
    )),
    visible_date: v.optional(v.string()),
    youtube_link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nodeId = await ctx.db.insert("nodes", {
      ...args,
      created_at: new Date().toISOString(),
    });
    return nodeId;
  },
});

// Update node
export const updateNode = mutation({
  args: {
    id: v.id("nodes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    index: v.optional(v.number()),
    is_recent: v.optional(v.boolean()),
    is_video: v.optional(v.boolean()),
    recent_work_date: v.optional(v.string()),
    technical: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("recent"),
      v.literal("photo"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("performance"),
      v.literal("installation"),
      v.literal("oil"),
      v.literal("drawing"),
      v.literal("abstract"),
      v.literal("digital"),
      v.literal("sculpture")
    )),
    visible_date: v.optional(v.string()),
    youtube_link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete node
export const deleteNode = mutation({
  args: { id: v.id("nodes") },
  handler: async (ctx, args) => {
    // First delete all related extras
    const extras = await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), args.id))
      .collect();
    
    for (const extra of extras) {
      await ctx.db.delete(extra._id);
    }
    
    // Then delete the node
    await ctx.db.delete(args.id);
  },
});

// Find node by Supabase ID
export const findNodeBySupabaseId = query({
  args: { supabaseId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("supabase_id"), args.supabaseId))
      .first();
  },
});

// Update node image URL by Supabase ID
export const updateNodeImageBySupabaseId = mutation({
  args: { 
    supabaseId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args) => {
    const node = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("supabase_id"), args.supabaseId))
      .first();
    
    if (node) {
      await ctx.db.patch(node._id, { image_url: args.imageUrl });
      return node._id;
    }
    return null;
  },
});

// Get first image of each node type for portfolio hover effects
export const getPortfolioImages = query({
  args: {},
  handler: async (ctx) => {
    const types = ["photo", "video", "audio", "performance", "installation", "drawing", "oil", "abstract", "digital", "sculpture"];
    const portfolioImages: Record<string, string> = {};
    
    for (const type of types) {
      const firstNode = await ctx.db
        .query("nodes")
        .filter((q) => q.eq(q.field("type"), type))
        .filter((q) => q.neq(q.field("is_video"), true))
        .order("asc")
        .first();
      
      if (firstNode && firstNode.image_url) {
        portfolioImages[type] = firstNode.image_url;
      }
    }
    
    return portfolioImages;
  },
});

// Check for duplicate nodes (for debugging)
export const checkForDuplicates = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const nodes = args.type 
      ? await ctx.db.query("nodes").filter((q) => q.eq(q.field("type"), args.type)).collect()
      : await ctx.db.query("nodes").collect();
    
    const duplicates = [];
    const seen = new Set();
    
    for (const node of nodes) {
      const key = `${node.name}-${node.type}-${node.image_url}`;
      if (seen.has(key)) {
        duplicates.push(node);
      } else {
        seen.add(key);
      }
    }
    
    return {
      totalNodes: nodes.length,
      uniqueNodes: seen.size,
      duplicates: duplicates.length,
      duplicateNodes: duplicates
    };
  },
});
