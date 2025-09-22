import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration function to transfer data from Supabase to Convex
export const migrateFromSupabase = mutation({
  args: {
      nodes: v.array(v.object({
        id: v.string(),
        name: v.union(v.string(), v.null()),
        description: v.union(v.string(), v.null()),
        image_url: v.union(v.string(), v.null()),
        index: v.union(v.number(), v.null()),
        is_recent: v.union(v.boolean(), v.null()),
        is_video: v.union(v.boolean(), v.null()),
        recent_work_date: v.union(v.string(), v.null()),
        technical: v.union(v.string(), v.null()),
        type: v.union(v.string(), v.null()),
        visible_date: v.union(v.string(), v.null()),
        youtube_link: v.union(v.string(), v.null()),
        created_at: v.string(),
        nodes_extras: v.optional(v.array(v.object({
          id: v.string(),
          node_id: v.string(),
          description: v.union(v.string(), v.null()),
          image_url: v.union(v.string(), v.null()),
          index: v.union(v.number(), v.null()),
          is_video: v.union(v.boolean(), v.null()),
          technical: v.union(v.string(), v.null()),
          youtube_url: v.union(v.string(), v.null()),
          created_at: v.string(),
        })))
      })),
    settings: v.optional(v.object({
      contact_facebook: v.union(v.string(), v.null()),
      contact_instagram: v.union(v.string(), v.null()),
      contact_mail: v.union(v.string(), v.null()),
      main_page_image_url: v.union(v.string(), v.null()),
      signature: v.union(v.string(), v.null()),
      statement_description: v.union(v.string(), v.null()),
      statement_image_url: v.union(v.string(), v.null()),
      statement_title: v.union(v.string(), v.null()),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      nodesCreated: 0,
      extrasCreated: 0,
      settingsCreated: false,
      errors: [] as string[]
    };

    try {
      // Migrate nodes
      for (const node of args.nodes) {
        try {
          const nodeId = await ctx.db.insert("nodes", {
            supabase_id: node.id, // Store original Supabase ID
            name: node.name || undefined,
            description: node.description || undefined,
            image_url: node.image_url || undefined, // This will be updated with Convex URLs later
            index: node.index || undefined,
            is_recent: node.is_recent || undefined,
            is_video: node.is_video || undefined,
            recent_work_date: node.recent_work_date || undefined,
            technical: node.technical || undefined,
            type: node.type as any || undefined,
            visible_date: node.visible_date || undefined,
            youtube_link: node.youtube_link || undefined,
            created_at: node.created_at,
          });
          results.nodesCreated++;

          // Migrate node extras
          if (node.nodes_extras) {
            for (const extra of node.nodes_extras) {
              try {
                await ctx.db.insert("nodes_extras", {
                  node_id: nodeId,
                  description: extra.description || undefined,
                  image_url: extra.image_url || undefined, // This will be updated with Convex URLs later
                  index: extra.index || undefined,
                  is_video: extra.is_video || undefined,
                  technical: extra.technical || undefined,
                  youtube_url: extra.youtube_url || undefined,
                  created_at: extra.created_at,
                });
                results.extrasCreated++;
              } catch (error) {
                results.errors.push(`Failed to create extra for node ${node.id}: ${error}`);
              }
            }
          }
        } catch (error) {
          results.errors.push(`Failed to create node ${node.id}: ${error}`);
        }
      }

      // Migrate settings
      if (args.settings) {
        try {
          await ctx.db.insert("settings", {
            contact_facebook: args.settings.contact_facebook || undefined,
            contact_instagram: args.settings.contact_instagram || undefined,
            contact_mail: args.settings.contact_mail || undefined,
            main_page_image_url: args.settings.main_page_image_url || undefined,
            signature: args.settings.signature || undefined,
            statement_description: args.settings.statement_description || undefined,
            statement_image_url: args.settings.statement_image_url || undefined,
            statement_title: args.settings.statement_title || undefined,
          });
          results.settingsCreated = true;
        } catch (error) {
          results.errors.push(`Failed to create settings: ${error}`);
        }
      }

    } catch (error) {
      results.errors.push(`Migration failed: ${error}`);
    }

    return results;
  },
});
