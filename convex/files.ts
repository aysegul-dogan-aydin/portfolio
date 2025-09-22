import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store file metadata and return file URL
export const storeFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    originalUrl: v.string(),
    type: v.string(), // 'node', 'extra', 'settings'
    nodeId: v.optional(v.string()), // Changed to string to handle Supabase IDs
    extraId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    
    if (!fileUrl) {
      throw new Error("Failed to get file URL from storage");
    }
    
    // Store file metadata
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      filename: args.filename,
      originalUrl: args.originalUrl,
      fileUrl: fileUrl,
      type: args.type,
      nodeId: args.nodeId,
      extraId: args.extraId,
      uploadedAt: new Date().toISOString(),
    });

    return { fileId, fileUrl };
  },
});

// Get file by original URL
export const getFileByOriginalUrl = query({
  args: { originalUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("originalUrl"), args.originalUrl))
      .first();
  },
});

// Get all files
export const getAllFiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("files").collect();
  },
});
