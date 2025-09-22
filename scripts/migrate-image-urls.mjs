import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function migrateImageUrls() {
  console.log("🔄 Starting image URL migration from Supabase to Convex...");
  
  try {
    // First, check the migration status
    console.log("📊 Checking migration status...");
    const status = await client.query(api.migrateImageUrls.getMigrationStatus);
    console.log("Migration Status:", status);
    
    if (!status.migrationNeeded) {
      console.log("✅ No migration needed - all URLs are already updated!");
      return;
    }
    
    // Migrate nodes in batches
    if (status.nodesWithSupabaseUrls > 0) {
      console.log(`🔄 Migrating ${status.nodesWithSupabaseUrls} nodes in batches...`);
      let totalUpdatedNodes = 0;
      let totalNotFoundNodes = 0;
      let hasMoreNodes = true;
      
      while (hasMoreNodes) {
        const batchResult = await client.mutation(api.migrateImageUrls.migrateNodeImageUrlsBatch, { limit: 5 });
        
        const updatedInBatch = batchResult.results.filter(r => r.status === 'updated').length;
        const notFoundInBatch = batchResult.results.filter(r => r.status === 'not_found').length;
        
        totalUpdatedNodes += updatedInBatch;
        totalNotFoundNodes += notFoundInBatch;
        hasMoreNodes = batchResult.hasMore;
        
        console.log(`   Processed batch: ${batchResult.processed} nodes (${updatedInBatch} updated, ${notFoundInBatch} not found)`);
        
        if (hasMoreNodes) {
          console.log("   Continuing with next batch...");
        }
      }
      
      console.log(`✅ Nodes migration completed:`);
      console.log(`   - Total updated: ${totalUpdatedNodes}`);
      console.log(`   - Total not found: ${totalNotFoundNodes}`);
      
      if (totalNotFoundNodes > 0) {
        console.log("⚠️  Some nodes couldn't be updated. Check the files table for missing mappings.");
      }
    }
    
    // Migrate extras in batches
    if (status.extrasWithSupabaseUrls > 0) {
      console.log(`🔄 Migrating ${status.extrasWithSupabaseUrls} extras in batches...`);
      let totalUpdatedExtras = 0;
      let totalNotFoundExtras = 0;
      let hasMoreExtras = true;
      
      while (hasMoreExtras) {
        const batchResult = await client.mutation(api.migrateImageUrls.migrateExtraImageUrlsBatch, { limit: 5 });
        
        const updatedInBatch = batchResult.results.filter(r => r.status === 'updated').length;
        const notFoundInBatch = batchResult.results.filter(r => r.status === 'not_found').length;
        
        totalUpdatedExtras += updatedInBatch;
        totalNotFoundExtras += notFoundInBatch;
        hasMoreExtras = batchResult.hasMore;
        
        console.log(`   Processed batch: ${batchResult.processed} extras (${updatedInBatch} updated, ${notFoundInBatch} not found)`);
        
        if (hasMoreExtras) {
          console.log("   Continuing with next batch...");
        }
      }
      
      console.log(`✅ Extras migration completed:`);
      console.log(`   - Total updated: ${totalUpdatedExtras}`);
      console.log(`   - Total not found: ${totalNotFoundExtras}`);
      
      if (totalNotFoundExtras > 0) {
        console.log("⚠️  Some extras couldn't be updated. Check the files table for missing mappings.");
      }
    }
    
    // Check final status
    console.log("📊 Final migration status...");
    const finalStatus = await client.query(api.migrateImageUrls.getMigrationStatus);
    console.log("Final Status:", finalStatus);
    
    if (!finalStatus.migrationNeeded) {
      console.log("🎉 Migration completed successfully! All image URLs have been updated to Convex.");
    } else {
      console.log("⚠️  Migration completed with some issues. Some URLs couldn't be updated.");
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateImageUrls();
