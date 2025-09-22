import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function removeDuplicates() {
  console.log("🗑️  Starting duplicate removal process...");
  
  try {
    // Get all nodes
    const allNodes = await client.query(api.nodes.getAllNodes);
    console.log(`📊 Total nodes: ${allNodes.length}`);
    
    // Group nodes by unique key (name + type + image_url)
    const nodeGroups = new Map();
    
    for (const node of allNodes) {
      const key = `${node.name || 'unnamed'}-${node.type || 'no-type'}-${node.image_url || 'no-image'}`;
      
      if (!nodeGroups.has(key)) {
        nodeGroups.set(key, []);
      }
      nodeGroups.get(key).push(node);
    }
    
    console.log(`📊 Unique groups: ${nodeGroups.size}`);
    
    // Find groups with duplicates
    const duplicateGroups = [];
    for (const [key, nodes] of nodeGroups) {
      if (nodes.length > 1) {
        duplicateGroups.push({ key, nodes });
      }
    }
    
    console.log(`⚠️  Found ${duplicateGroups.length} groups with duplicates`);
    
    let totalRemoved = 0;
    
    // Remove duplicates (keep the first one, remove the rest)
    for (const { key, nodes } of duplicateGroups) {
      console.log(`\n🔍 Processing group: ${key}`);
      console.log(`   Found ${nodes.length} duplicates`);
      
      // Sort by creation time to keep the oldest one
      const sortedNodes = nodes.sort((a, b) => a._creationTime - b._creationTime);
      const keepNode = sortedNodes[0];
      const removeNodes = sortedNodes.slice(1);
      
      console.log(`   Keeping: ${keepNode._id} (created: ${new Date(keepNode._creationTime).toISOString()})`);
      
      // Remove the duplicate nodes
      for (const nodeToRemove of removeNodes) {
        try {
          await client.mutation(api.nodes.deleteNode, { id: nodeToRemove._id });
          console.log(`   ✅ Removed: ${nodeToRemove._id}`);
          totalRemoved++;
        } catch (error) {
          console.log(`   ❌ Failed to remove ${nodeToRemove._id}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Duplicate removal completed!`);
    console.log(`   Total duplicates removed: ${totalRemoved}`);
    
    // Check final status
    const finalCheck = await client.query(api.nodes.checkForDuplicates);
    console.log(`\n📊 Final status:`);
    console.log(`   Total nodes: ${finalCheck.totalNodes}`);
    console.log(`   Unique nodes: ${finalCheck.uniqueNodes}`);
    console.log(`   Remaining duplicates: ${finalCheck.duplicates}`);
    
  } catch (error) {
    console.error("❌ Error removing duplicates:", error);
  }
}

// Run the duplicate removal
removeDuplicates();
