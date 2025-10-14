import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin: Get all nodes with pagination and search
export const adminGetAllNodes = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("nodes");
    
    // Apply type filter if provided
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    // Apply search filter if provided
    if (args.search) {
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("name"), args.search),
          q.eq(q.field("description"), args.search)
        )
      );
    }
    
    // Get total count
    const allNodes = await query.collect();
    const total = allNodes.length;
    
    // Apply pagination
    const nodes = allNodes
      .slice(args.offset || 0, (args.offset || 0) + (args.limit || 50))
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    
    return {
      nodes,
      total,
      hasMore: (args.offset || 0) + (args.limit || 50) < total,
    };
  },
});

// Admin: Get single node with all extras for editing
export const adminGetNode = query({
  args: { id: v.id("nodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) return null;
    
    const extras = await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), args.id))
      .order("asc")
      .collect();
    
    return { ...node, nodes_extras: extras };
  },
});

// Admin: Update node
export const adminUpdateNode = mutation({
  args: {
    id: v.id("nodes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    index: v.optional(v.number()),
    is_recent: v.optional(v.boolean()),
    recent_index: v.optional(v.number()),
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
    return id;
  },
});

// Admin: Create new node
export const adminCreateNode = mutation({
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

// Admin: Delete node
export const adminDeleteNode = mutation({
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
    return args.id;
  },
});

// Admin: Get node extras
export const adminGetNodeExtras = query({
  args: { nodeId: v.id("nodes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), args.nodeId))
      .order("asc")
      .collect();
  },
});

// Admin: Create node extra
export const adminCreateNodeExtra = mutation({
  args: {
    node_id: v.id("nodes"),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    index: v.optional(v.number()),
    is_video: v.optional(v.boolean()),
    technical: v.optional(v.string()),
    youtube_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const extraId = await ctx.db.insert("nodes_extras", {
      ...args,
      created_at: new Date().toISOString(),
    });
    return extraId;
  },
});

// Admin: Update node extra
export const adminUpdateNodeExtra = mutation({
  args: {
    id: v.id("nodes_extras"),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()),
    index: v.optional(v.number()),
    is_video: v.optional(v.boolean()),
    technical: v.optional(v.string()),
    youtube_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Admin: Delete node extra
export const adminDeleteNodeExtra = mutation({
  args: { id: v.id("nodes_extras") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Admin: Reorder node extras
export const adminReorderNodeExtras = mutation({
  args: {
    nodeId: v.id("nodes"),
    extraIds: v.array(v.id("nodes_extras")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.extraIds.length; i++) {
      await ctx.db.patch(args.extraIds[i], { index: i });
    }
    return args.extraIds;
  },
});

// Admin: Move extra up in order
export const adminMoveExtraUp = mutation({
  args: {
    extraId: v.id("nodes_extras"),
  },
  handler: async (ctx, args) => {
    const extra = await ctx.db.get(args.extraId);
    if (!extra) return null;

    // Get all extras for the same node, sorted by index
    const sameNodeExtras = await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), extra.node_id))
      .collect();

    // Sort by index
    sameNodeExtras.sort((a, b) => (a.index || 0) - (b.index || 0));

    const currentIndex = sameNodeExtras.findIndex(e => e._id === args.extraId);
    if (currentIndex <= 0) return null; // Already at top

    // Swap with previous extra
    const prevExtra = sameNodeExtras[currentIndex - 1];
    const currentIndexValue = extra.index || currentIndex;
    const prevIndexValue = prevExtra.index || currentIndex - 1;

    await ctx.db.patch(args.extraId, { index: prevIndexValue });
    await ctx.db.patch(prevExtra._id, { index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Move extra down in order
export const adminMoveExtraDown = mutation({
  args: {
    extraId: v.id("nodes_extras"),
  },
  handler: async (ctx, args) => {
    const extra = await ctx.db.get(args.extraId);
    if (!extra) return null;

    // Get all extras for the same node, sorted by index
    const sameNodeExtras = await ctx.db
      .query("nodes_extras")
      .filter((q) => q.eq(q.field("node_id"), extra.node_id))
      .collect();

    // Sort by index
    sameNodeExtras.sort((a, b) => (a.index || 0) - (b.index || 0));

    const currentIndex = sameNodeExtras.findIndex(e => e._id === args.extraId);
    if (currentIndex >= sameNodeExtras.length - 1) return null; // Already at bottom

    // Swap with next extra
    const nextExtra = sameNodeExtras[currentIndex + 1];
    const currentIndexValue = extra.index || currentIndex;
    const nextIndexValue = nextExtra.index || currentIndex + 1;

    await ctx.db.patch(args.extraId, { index: nextIndexValue });
    await ctx.db.patch(nextExtra._id, { index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Reorder nodes within a type
export const adminReorderNodes = mutation({
  args: {
    type: v.string(),
    nodeIds: v.array(v.id("nodes")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.nodeIds.length; i++) {
      await ctx.db.patch(args.nodeIds[i], { index: i });
    }
    return args.nodeIds;
  },
});

// Admin: Move node up in order
export const adminMoveNodeUp = mutation({
  args: {
    nodeId: v.id("nodes"),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node || !node.type) return null;

    // Get all nodes of the same type, sorted by index
    const sameTypeNodes = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("type"), node.type))
      .collect();

    // Sort by index
    sameTypeNodes.sort((a, b) => (a.index || 0) - (b.index || 0));

    const currentIndex = sameTypeNodes.findIndex(n => n._id === args.nodeId);
    if (currentIndex <= 0) return null; // Already at top

    // Swap with previous node
    const prevNode = sameTypeNodes[currentIndex - 1];
    const currentIndexValue = node.index || currentIndex;
    const prevIndexValue = prevNode.index || currentIndex - 1;

    await ctx.db.patch(args.nodeId, { index: prevIndexValue });
    await ctx.db.patch(prevNode._id, { index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Move node down in order
export const adminMoveNodeDown = mutation({
  args: {
    nodeId: v.id("nodes"),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node || !node.type) return null;

    // Get all nodes of the same type, sorted by index
    const sameTypeNodes = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("type"), node.type))
      .collect();

    // Sort by index
    sameTypeNodes.sort((a, b) => (a.index || 0) - (b.index || 0));

    const currentIndex = sameTypeNodes.findIndex(n => n._id === args.nodeId);
    if (currentIndex >= sameTypeNodes.length - 1) return null; // Already at bottom

    // Swap with next node
    const nextNode = sameTypeNodes[currentIndex + 1];
    const currentIndexValue = node.index || currentIndex;
    const nextIndexValue = nextNode.index || currentIndex + 1;

    await ctx.db.patch(args.nodeId, { index: nextIndexValue });
    await ctx.db.patch(nextNode._id, { index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Get statistics
export const adminGetStats = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("nodes").collect();
    const extras = await ctx.db.query("nodes_extras").collect();
    
    const typeCounts: Record<string, number> = {};
    nodes.forEach(node => {
      if (node.type) {
        typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
      }
    });
    
    return {
      totalNodes: nodes.length,
      totalExtras: extras.length,
      typeCounts,
      recentNodes: nodes.filter(n => n.is_recent).length,
      videoNodes: nodes.filter(n => n.is_video).length,
    };
  },
});

// Admin: Generate upload URL for file uploads
export const adminGenerateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Admin: Save uploaded file info
export const adminSaveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    type: v.string(), // 'node' or 'extra'
    nodeId: v.optional(v.id("nodes")),
    extraId: v.optional(v.id("nodes_extras")),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("Failed to get file URL");
    }

    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      filename: args.filename,
      originalUrl: fileUrl,
      fileUrl: fileUrl,
      type: args.type,
      nodeId: args.nodeId,
      extraId: args.extraId,
      uploadedAt: new Date().toISOString(),
    });

    return { fileId, fileUrl };
  },
});

// Admin: Get recent items ordered by recent_index
export const adminGetRecentItems = query({
  args: {},
  handler: async (ctx) => {
    const recentItems = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("is_recent"), true))
      .collect();
    
    // Sort by recent_index (ascending), with null values at the end
    return recentItems.sort((a, b) => {
      const aIndex = a.recent_index ?? Number.MAX_SAFE_INTEGER;
      const bIndex = b.recent_index ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  },
});

// Admin: Reorder recent items
export const adminReorderRecentItems = mutation({
  args: {
    nodeIds: v.array(v.id("nodes")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.nodeIds.length; i++) {
      await ctx.db.patch(args.nodeIds[i], { recent_index: i });
    }
    return args.nodeIds;
  },
});

// Admin: Move recent item up
export const adminMoveRecentItemUp = mutation({
  args: {
    nodeId: v.id("nodes"),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node || !node.is_recent) return null;

    // Get all recent items sorted by recent_index
    const recentItems = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("is_recent"), true))
      .collect();

    recentItems.sort((a, b) => {
      const aIndex = a.recent_index ?? Number.MAX_SAFE_INTEGER;
      const bIndex = b.recent_index ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });

    const currentIndex = recentItems.findIndex(n => n._id === args.nodeId);
    if (currentIndex <= 0) return null; // Already at top

    // Swap with previous item
    const prevItem = recentItems[currentIndex - 1];
    const currentIndexValue = node.recent_index ?? currentIndex;
    const prevIndexValue = prevItem.recent_index ?? currentIndex - 1;

    await ctx.db.patch(args.nodeId, { recent_index: prevIndexValue });
    await ctx.db.patch(prevItem._id, { recent_index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Move recent item down
export const adminMoveRecentItemDown = mutation({
  args: {
    nodeId: v.id("nodes"),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node || !node.is_recent) return null;

    // Get all recent items sorted by recent_index
    const recentItems = await ctx.db
      .query("nodes")
      .filter((q) => q.eq(q.field("is_recent"), true))
      .collect();

    recentItems.sort((a, b) => {
      const aIndex = a.recent_index ?? Number.MAX_SAFE_INTEGER;
      const bIndex = b.recent_index ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });

    const currentIndex = recentItems.findIndex(n => n._id === args.nodeId);
    if (currentIndex >= recentItems.length - 1) return null; // Already at bottom

    // Swap with next item
    const nextItem = recentItems[currentIndex + 1];
    const currentIndexValue = node.recent_index ?? currentIndex;
    const nextIndexValue = nextItem.recent_index ?? currentIndex + 1;

    await ctx.db.patch(args.nodeId, { recent_index: nextIndexValue });
    await ctx.db.patch(nextItem._id, { recent_index: currentIndexValue });

    return { moved: true };
  },
});

// Admin: Update recent index directly
export const adminUpdateRecentIndex = mutation({
  args: {
    nodeId: v.id("nodes"),
    recent_index: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nodeId, { recent_index: args.recent_index });
    return args.nodeId;
  },
});
