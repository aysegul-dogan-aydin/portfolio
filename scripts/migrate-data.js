import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';

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

async function migrateData() {
  console.log('Starting data migration from Supabase to Convex...');
  
  try {
    // Get all data from Supabase
    console.log('Fetching data from Supabase...');
    
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*, nodes_extras(*)');
    
    if (nodesError) {
      throw nodesError;
    }
    
    const { data: settings, error: settingsError } = await supabase
      .from('setttings')
      .select('*')
      .single();
    
    if (settingsError) {
      throw settingsError;
    }
    
    console.log(`Found ${nodes.length} nodes and settings data`);
    
    // Prepare data for Convex migration
    const migrationData = {
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.name,
        description: node.description,
        image_url: node.image_url,
        index: node.index,
        is_recent: node.is_recent,
        is_video: node.is_video,
        recent_work_date: node.recent_work_date,
        technical: node.technical,
        type: node.type,
        visible_date: node.visible_date,
        youtube_link: node.youtube_link,
        created_at: node.created_at,
        nodes_extras: node.nodes_extras || []
      })),
      settings: {
        contact_facebook: settings.contact_facebook,
        contact_instagram: settings.contact_instagram,
        contact_mail: settings.contact_mail,
        main_page_image_url: settings.main_page_image_url,
        signature: settings.signature,
        statement_description: settings.statement_description,
        statement_image_url: settings.statement_image_url,
        statement_title: settings.statement_title,
      }
    };
    
    console.log('Migrating data to Convex...');
    
    // Call Convex migration function
    const result = await convex.mutation(api.migrations.migrateFromSupabase, migrationData);
    
    console.log('\nMigration completed!');
    console.log(`Nodes created: ${result.nodesCreated}`);
    console.log(`Extras created: ${result.extrasCreated}`);
    console.log(`Settings created: ${result.settingsCreated}`);
    
    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log('\nNext steps:');
    console.log('1. Run the image migration script to transfer images');
    console.log('2. Update your components to use Convex instead of Supabase');
    console.log('3. Test your application');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateData();
