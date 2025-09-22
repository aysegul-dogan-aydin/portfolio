import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  nodes: defineTable({
    supabase_id: v.optional(v.string()), // Store original Supabase ID for mapping
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()), // Will store Convex file URL
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
    created_at: v.string(),
  })
  .index("by_type", ["type"])
  .index("by_is_recent", ["is_recent"])
  .index("by_supabase_id", ["supabase_id"]),

  nodes_extras: defineTable({
    node_id: v.id("nodes"),
    description: v.optional(v.string()),
    image_url: v.optional(v.string()), // Will store Convex file URL
    index: v.optional(v.number()),
    is_video: v.optional(v.boolean()),
    technical: v.optional(v.string()),
    youtube_url: v.optional(v.string()),
    created_at: v.string(),
  }),

  settings: defineTable({
    contact_facebook: v.optional(v.string()),
    contact_instagram: v.optional(v.string()),
    contact_mail: v.optional(v.string()),
    main_page_image_url: v.optional(v.string()), // Will store Convex file URL
    signature: v.optional(v.string()),
    statement_description: v.optional(v.string()),
    statement_image_url: v.optional(v.string()), // Will store Convex file URL
    statement_title: v.optional(v.string()),
  }),

  files: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    originalUrl: v.string(),
    fileUrl: v.string(),
    type: v.string(), // 'node', 'extra', 'settings'
    nodeId: v.optional(v.string()), // Changed to string to handle Supabase IDs
    extraId: v.optional(v.string()),
    uploadedAt: v.string(),
  }),
});
