import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings;
  },
});

// Update settings
export const updateSettings = mutation({
  args: {
    contact_facebook: v.optional(v.string()),
    contact_instagram: v.optional(v.string()),
    contact_mail: v.optional(v.string()),
    main_page_image_url: v.optional(v.string()),
    signature: v.optional(v.string()),
    statement_description: v.optional(v.string()),
    statement_image_url: v.optional(v.string()),
    statement_title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db.query("settings").first();
    
    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, args);
      return existingSettings._id;
    } else {
      return await ctx.db.insert("settings", args);
    }
  },
});
