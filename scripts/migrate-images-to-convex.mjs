import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
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
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !CONVEX_URL) {
  console.error('Please set all required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('- NEXT_PUBLIC_CONVEX_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const convex = new ConvexHttpClient(CONVEX_URL);

async function downloadImage(url, filename) {
  try {
    console.log(`Downloading: ${url}`);
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
    console.log(`Downloaded: ${filename}`);
    return filePath;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

async function uploadToConvex(filePath, originalUrl, type, nodeId = null, extraId = null) {
  try {
    console.log(`Uploading to Convex: ${filePath}`);
    
    // Generate upload URL
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl);
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    
    // Determine content type based on file extension
    const extension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (extension === '.jpg' || extension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (extension === '.png') {
      contentType = 'image/png';
    } else if (extension === '.gif') {
      contentType = 'image/gif';
    } else if (extension === '.webp') {
      contentType = 'image/webp';
    }
    
    // Upload file to Convex
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBuffer,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }
    
    const { storageId } = await uploadResponse.json();
    
    // Prepare metadata - only include nodeId and extraId if they're not null
    const metadata = {
      storageId,
      filename,
      originalUrl,
      type,
    };
    
    if (nodeId) {
      metadata.nodeId = nodeId;
    }
    
    if (extraId) {
      metadata.extraId = extraId;
    }
    
    // Store file metadata
    const { fileUrl } = await convex.mutation(api.files.storeFileMetadata, metadata);
    
    console.log(`Uploaded successfully: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`Failed to upload to Convex:`, error.message);
    return null;
  }
}

async function updateNodeImageUrl(supabaseNodeId, newImageUrl) {
  try {
    await convex.mutation(api.nodes.updateNodeImageBySupabaseId, {
      supabaseId: supabaseNodeId,
      imageUrl: newImageUrl,
    });
    console.log(`Updated node ${supabaseNodeId} with new image URL`);
  } catch (error) {
    console.error(`Failed to update node ${supabaseNodeId}:`, error.message);
  }
}

async function updateSettingsImageUrl(field, newImageUrl) {
  try {
    const settings = await convex.query(api.settings.getSettings);
    if (settings) {
      await convex.mutation(api.settings.updateSettings, {
        [field]: newImageUrl,
      });
      console.log(`Updated settings ${field} with new image URL`);
    }
  } catch (error) {
    console.error(`Failed to update settings ${field}:`, error.message);
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
          const convexUrl = await uploadToConvex(filePath, node.image_url, 'node', node.id);
          if (convexUrl) {
            // Update the node with new image URL
            await updateNodeImageUrl(node.id, convexUrl);
            
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
          const convexUrl = await uploadToConvex(filePath, extra.image_url, 'extra', null, extra.id);
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
            const convexUrl = await uploadToConvex(filePath, image.value, 'settings');
            if (convexUrl) {
              // Update settings with new image URL
              await updateSettingsImageUrl(image.field, convexUrl);
              
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
    const resultsPath = path.join(__dirname, 'image-migration-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(migrationResults, null, 2));
    
    console.log('\nImage migration completed!');
    console.log(`Nodes migrated: ${migrationResults.nodes.length}`);
    console.log(`Extras migrated: ${migrationResults.extras.length}`);
    console.log(`Settings images migrated: ${Object.keys(migrationResults.settings).length}`);
    console.log(`Errors: ${migrationResults.errors.length}`);
    
    if (migrationResults.errors.length > 0) {
      console.log('\nErrors:');
      migrationResults.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log(`\nResults saved to: ${resultsPath}`);
    
    // Clean up temp files
    const tempDir = path.join(__dirname, 'temp-images');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateImages();
