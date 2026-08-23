import { websiteAdminApp, omnitoolAdminApp } from './server/firebaseAdmin.js';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';
import router from './server/routes/omnitool.js';
import express from 'express';

async function test() {
  console.log('--- TEST 1: Website Admin Connection ---');
  try {
    if (websiteAdminApp) {
        console.log('SUCCESS: websiteAdminApp is initialized. Project:', websiteAdminApp.options.projectId || websiteAdminApp.name);
    } else {
        console.log('FAILED: websiteAdminApp is null');
    }
  } catch(e: any) { console.error('FAILED:', e.message); }

  console.log('\n--- TEST 2: OmniTool Admin Connection ---');
  try {
    if (omnitoolAdminApp) {
        console.log('SUCCESS: omnitoolAdminApp is initialized. Project:', omnitoolAdminApp.options.projectId || 'Defined in credential');
    } else {
        console.log('FAILED: omnitoolAdminApp is null');
    }
  } catch(e: any) { console.error('FAILED:', e.message); }

  console.log('\n--- TEST 3: Secure Read from OmniTool DB ---');
  try {
    const db = getDatabase(omnitoolAdminApp!);
    const snapshot = await db.ref('users').limitToFirst(5).once('value');
    console.log('SUCCESS: Read users successfully. Found records:', snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
  } catch(e: any) { console.error('FAILED:', e.message); }

  console.log('\n--- TEST 4 & 5: Website Admin Auth & GET Endpoint ---');
  console.log('(Mocking ID Token verification to simulate an authenticated request from aniketrajcargal123@gmail.com)');
  
  const authInstance = getAuth(websiteAdminApp);
  const originalVerify = authInstance.verifyIdToken.bind(authInstance);
  authInstance.verifyIdToken = async () => ({ email: 'aniketrajcargal123@gmail.com', uid: 'test-uid' } as any);
  
  const app = express();
  app.use('/api/omnitool', router);
  
  const server = app.listen(3001, async () => {
     try {
         const res = await fetch('http://localhost:3001/api/omnitool/users', {
             headers: { 'Authorization': 'Bearer fake-token' }
         });
         const data = await res.json();
         if (res.ok && Array.isArray(data)) {
             console.log('SUCCESS: GET /api/omnitool/users returned', data.length, 'users.');
             const sample = data[0];
             if (sample) {
                 console.log('Sample user object (passwords should be stripped):');
                 console.log(JSON.stringify(sample, null, 2));
             }
         } else {
             console.log('FAILED: status', res.status, data);
         }
     } catch(e: any) {
         console.error('FAILED:', e.message);
     } finally {
         server.close();
         process.exit(0);
     }
  });
}
test();
