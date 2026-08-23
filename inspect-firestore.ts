import { websiteAdminApp } from './server/firebaseAdmin.js';
import { getFirestore } from 'firebase-admin/firestore';

async function inspect() {
  console.log('\n--- Inspecting Editors Hub Store Firestore ---');
  try {
    const db = getFirestore(websiteAdminApp);
    const collections = await db.listCollections();
    console.log('Collections in Firestore:', collections.map(c => c.id));
  } catch (e: any) {
    console.error('Failed to read Firestore:', e.message);
  }
  process.exit(0);
}
inspect();
