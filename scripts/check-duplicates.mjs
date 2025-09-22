import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function checkDuplicates() {
  console.log("🔍 Checking for duplicate nodes...");
  
  try {
    // Check all nodes
    const allNodesCheck = await client.query(api.nodes.checkForDuplicates);
    console.log("All nodes:", allNodesCheck);
    
    // Check specific types
    const types = ["photo", "video", "audio", "performance", "installation", "drawing", "oil", "abstract", "digital", "sculpture"];
    
    for (const type of types) {
      const typeCheck = await client.query(api.nodes.checkForDuplicates, { type });
      if (typeCheck.duplicates > 0) {
        console.log(`\n⚠️  ${type.toUpperCase()} has ${typeCheck.duplicates} duplicates:`);
        console.log(`   Total: ${typeCheck.totalNodes}, Unique: ${typeCheck.uniqueNodes}`);
        console.log("   Duplicate nodes:", typeCheck.duplicateNodes);
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking duplicates:", error);
  }
}

// Run the check
checkDuplicates();
