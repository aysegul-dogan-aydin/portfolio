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
  console.error('Please set all required environment variables');
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

async function testSingleImage() {
  console.log('Testing single image migration...');
  
  try {
    // Get just one node with an image
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .limit(1);
    
    if (nodesError) {
      throw nodesError;
    }
    
    if (!nodes || nodes.length === 0) {
      console.log('No nodes with images found');
      return;
    }
    
    const node = nodes[0];
    console.log(`Testing with node: ${node.id} - ${node.name}`);
    console.log(`Image URL: ${node.image_url}`);
    
    const filename = `test-node-${node.id}-${Date.now()}.jpg`;
    const filePath = await downloadImage(node.image_url, filename);
    
    if (filePath) {
      const convexUrl = await uploadToConvex(filePath, node.image_url, 'node');
      if (convexUrl) {
        console.log(`✅ Success! Image migrated to: ${convexUrl}`);
        
        // Test updating the node with new URL
        try {
          await convex.mutation(api.nodes.updateNodeImageBySupabaseId, {
            supabaseId: node.id,
            imageUrl: convexUrl,
          });
          console.log(`✅ Node updated with new image URL`);
        } catch (error) {
          console.error(`❌ Failed to update node:`, error.message);
        }
      }
    }
    
    // Clean up temp files
    const tempDir = path.join(__dirname, 'temp-images');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testSingleImage();
