import { websiteAdminApp, omnitoolAdminApp } from './server/firebaseAdmin.js';
import { getDatabase } from 'firebase-admin/database';

async function inspect() {
  console.log('--- Inspecting OmniTool Legacy DB ---');
  try {
    const omniDb = getDatabase(omnitoolAdminApp!);
    const omniUsers = await omniDb.ref('users').once('value');
    console.log('Total OmniTool users:', omniUsers.exists() ? Object.keys(omniUsers.val()).length : 0);
    if (omniUsers.exists()) {
       console.log('Sample OmniTool user:', JSON.stringify(Object.values(omniUsers.val())[0], null, 2));
    }
  } catch (e: any) {
    console.error('Failed to read OmniTool DB:', e.message);
  }

  console.log('\n--- Inspecting Editors Hub Store DB ---');
  try {
    // Note: websiteAdminApp might not have a databaseURL configured if it was only used for Auth.
    // Let's check if we can access the default RTDB for the project.
    // Usually it's https://<project-id>-default-rtdb.firebaseio.com
    const defaultDbUrl = `https://${websiteAdminApp.options.projectId}-default-rtdb.firebaseio.com`;
    console.log('Attempting to read from:', defaultDbUrl);
    const mainDb = getDatabase(websiteAdminApp); // this will use the default or we might need to specify url
    
    const rootSnapshot = await mainDb.ref('/').limitToFirst(10).once('value');
    if (rootSnapshot.exists()) {
       console.log('Top-level keys in editors-hub-store:', Object.keys(rootSnapshot.val()));
    } else {
       console.log('editors-hub-store RTDB is empty or does not exist at default URL.');
    }
    
    const omnitoolNamespace = await mainDb.ref('omnitool').once('value');
    console.log('Does /omnitool exist in editors-hub-store?', omnitoolNamespace.exists());
    
  } catch (e: any) {
    console.error('Failed to read Editors Hub Store DB:', e.message);
  }
  process.exit(0);
}

inspect();
