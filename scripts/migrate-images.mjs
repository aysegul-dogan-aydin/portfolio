import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CONVEX_URL = process.env.CONVEX_URL || 'http://localhost:3000'; // Adjust if needed

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function uploadToConvex(filePath, originalUrl) {
  try {
    // This is a placeholder - you'll need to implement actual Convex file upload
    // For now, we'll return a mock URL structure
    const filename = path.basename(filePath);
    const convexUrl = `https://your-convex-deployment.convex.cloud/api/storage/${filename}`;
    
    console.log(`Would upload ${filePath} to Convex as ${convexUrl}`);
    return convexUrl;
  } catch (error) {
    console.error(`Failed to upload to Convex:`, error.message);
    return null;
  }
}

async function migrateImages() {
  console.log('Starting image migration from Supabase to Convex...');
  
  try {
    // Get all nodes with images
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id, name, image_url')
      .not('image_url', 'is', null);
    
    if (nodesError) {
      throw nodesError;
    }
    
    console.log(`Found ${nodes.length} nodes with images`);
    
    // Get all node extras with images
    const { data: extras, error: extrasError } = await supabase
      .from('nodes_extras')
      .select('id, node_id, image_url')
      .not('image_url', 'is', null);
    
    if (extrasError) {
      throw extrasError;
    }
    
    console.log(`Found ${extras.length} node extras with images`);
    
    // Get settings with images
    const { data: settings, error: settingsError } = await supabase
      .from('setttings')
      .select('*')
      .single();
    
    if (settingsError) {
      throw settingsError;
    }
    
    const migrationResults = {
      nodes: [],
      extras: [],
      settings: {},
      errors: []
    };
    
    // Process node images
    for (const node of nodes) {
      try {
        const filename = `node-${node.id}-${Date.now()}.jpg`;
        const filePath = await downloadImage(node.image_url, filename);
        
        if (filePath) {
          const convexUrl = await uploadToConvex(filePath, node.image_url);
          if (convexUrl) {
            migrationResults.nodes.push({
              id: node.id,
              originalUrl: node.image_url,
              convexUrl: convexUrl,
              filename: filename
            });
          }
        }
      } catch (error) {
        migrationResults.errors.push(`Node ${node.id}: ${error.message}`);
      }
    }
    
    // Process extra images
    for (const extra of extras) {
      try {
        const filename = `extra-${extra.id}-${Date.now()}.jpg`;
        const filePath = await downloadImage(extra.image_url, filename);
        
        if (filePath) {
          const convexUrl = await uploadToConvex(filePath, extra.image_url);
          if (convexUrl) {
            migrationResults.extras.push({
              id: extra.id,
              nodeId: extra.node_id,
              originalUrl: extra.image_url,
              convexUrl: convexUrl,
              filename: filename
            });
          }
        }
      } catch (error) {
        migrationResults.errors.push(`Extra ${extra.id}: ${error.message}`);
      }
    }
    
    // Process settings images
    const settingsImages = [
      { field: 'statement_image_url', value: settings.statement_image_url },
      { field: 'main_page_image_url', value: settings.main_page_image_url }
    ];
    
    for (const image of settingsImages) {
      if (image.value) {
        try {
          const filename = `settings-${image.field}-${Date.now()}.jpg`;
          const filePath = await downloadImage(image.value, filename);
          
          if (filePath) {
            const convexUrl = await uploadToConvex(filePath, image.value);
            if (convexUrl) {
              migrationResults.settings[image.field] = {
                originalUrl: image.value,
                convexUrl: convexUrl,
                filename: filename
              };
            }
          }
        } catch (error) {
          migrationResults.errors.push(`Settings ${image.field}: ${error.message}`);
        }
      }
    }
    
    // Save migration results
    const resultsPath = path.join(__dirname, 'migration-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(migrationResults, null, 2));
    
    console.log('\nMigration completed!');
    console.log(`Nodes migrated: ${migrationResults.nodes.length}`);
    console.log(`Extras migrated: ${migrationResults.extras.length}`);
    console.log(`Settings images migrated: ${Object.keys(migrationResults.settings).length}`);
    console.log(`Errors: ${migrationResults.errors.length}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('\nErrors:');
      migrationResults.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log(`\nResults saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateImages();
