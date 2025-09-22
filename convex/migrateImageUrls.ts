import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all nodes with their current image URLs
export const getAllNodesWithImages = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("nodes").collect();
    return nodes.filter(node => node.image_url && node.image_url.includes('supabase'));
  },
});

// Get all nodes_extras with their current image URLs
export const getAllExtrasWithImages = query({
  args: {},
  handler: async (ctx) => {
    const extras = await ctx.db.query("nodes_extras").collect();
    return extras.filter(extra => extra.image_url && extra.image_url.includes('supabase'));
  },
});

// Update a single node's image URL
export const updateNodeImageUrl = mutation({
  args: {
    nodeId: v.id("nodes"),
    newImageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, {
      image_url: args.newImageUrl,
    });
    return args.nodeId;
  },
});

// Update a single extra's image URL
export const updateExtraImageUrl = mutation({
  args: {
    extraId: v.id("nodes_extras"),
    newImageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.extraId, {
      image_url: args.newImageUrl,
    });
    return args.extraId;
  },
});

// Find Convex file URL by original Supabase URL
export const findConvexFileByOriginalUrl = query({
  args: { originalUrl: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("originalUrl"), args.originalUrl))
      .first();
    return file;
  },
});

// Migrate nodes in batches to avoid hitting limits
export const migrateNodeImageUrlsBatch = mutation({
  args: { 
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const batchSize = args.limit || 10; // Process 10 nodes at a time
    
    // Get a small batch of nodes with Supabase URLs
    const allNodes = await ctx.db.query("nodes").collect();
    const nodesWithSupabaseUrls = allNodes.filter(node => 
      node.image_url && node.image_url.includes('supabase')
    ).slice(0, batchSize);

    const results = [];
    
    for (const node of nodesWithSupabaseUrls) {
      if (!node.image_url) continue;
      
      // Find the corresponding Convex file
      const convexFile = await ctx.db
        .query("files")
        .filter((q) => q.eq(q.field("originalUrl"), node.image_url))
        .first();
      
      if (convexFile) {
        // Update the node with the new Convex URL
        await ctx.db.patch(node._id, {
          image_url: convexFile.fileUrl,
        });
        results.push({
          nodeId: node._id,
          oldUrl: node.image_url,
          newUrl: convexFile.fileUrl,
          status: 'updated'
        });
      } else {
        results.push({
          nodeId: node._id,
          oldUrl: node.image_url,
          newUrl: null,
          status: 'not_found'
        });
      }
    }
    
    return {
      processed: results.length,
      results,
      hasMore: allNodes.filter(node => 
        node.image_url && node.image_url.includes('supabase')
      ).length > batchSize
    };
  },
});

// Migrate extras in batches to avoid hitting limits
export const migrateExtraImageUrlsBatch = mutation({
  args: { 
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const batchSize = args.limit || 10; // Process 10 extras at a time
    
    // Get a small batch of extras with Supabase URLs
    const allExtras = await ctx.db.query("nodes_extras").collect();
    const extrasWithSupabaseUrls = allExtras.filter(extra => 
      extra.image_url && extra.image_url.includes('supabase')
    ).slice(0, batchSize);

    const results = [];
    
    for (const extra of extrasWithSupabaseUrls) {
      if (!extra.image_url) continue;
      
      // Find the corresponding Convex file
      const convexFile = await ctx.db
        .query("files")
        .filter((q) => q.eq(q.field("originalUrl"), extra.image_url))
        .first();
      
      if (convexFile) {
        // Update the extra with the new Convex URL
        await ctx.db.patch(extra._id, {
          image_url: convexFile.fileUrl,
        });
        results.push({
          extraId: extra._id,
          oldUrl: extra.image_url,
          newUrl: convexFile.fileUrl,
          status: 'updated'
        });
      } else {
        results.push({
          extraId: extra._id,
          oldUrl: extra.image_url,
          newUrl: null,
          status: 'not_found'
        });
      }
    }
    
    return {
      processed: results.length,
      results,
      hasMore: allExtras.filter(extra => 
        extra.image_url && extra.image_url.includes('supabase')
      ).length > batchSize
    };
  },
});

// Get migration status - count how many records still have Supabase URLs
export const getMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("nodes").collect();
    const extras = await ctx.db.query("nodes_extras").collect();
    
    const nodesWithSupabaseUrls = nodes.filter(node => 
      node.image_url && node.image_url.includes('supabase')
    );
    
    const extrasWithSupabaseUrls = extras.filter(extra => 
      extra.image_url && extra.image_url.includes('supabase')
    );
    
    return {
      totalNodes: nodes.length,
      nodesWithSupabaseUrls: nodesWithSupabaseUrls.length,
      totalExtras: extras.length,
      extrasWithSupabaseUrls: extrasWithSupabaseUrls.length,
      migrationNeeded: nodesWithSupabaseUrls.length > 0 || extrasWithSupabaseUrls.length > 0
    };
  },
});
