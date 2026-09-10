import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function parsePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;

  let cleanedKey = key.trim();

  // Remove surrounding double or single quotes
  if (
    (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) ||
    (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))
  ) {
    cleanedKey = cleanedKey.slice(1, -1);
  }

  // Handle Base64 encoded private keys
  if (!cleanedKey.includes('BEGIN PRIVATE KEY')) {
    try {
      cleanedKey = Buffer.from(cleanedKey, 'base64').toString('utf-8');
    } catch {
      // Ignore base64 decode failure
    }
  }

  // Replace literal '\n' characters with actual newlines
  return cleanedKey.replace(/\\n/g, '\n');
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (getApps().length === 0) {
  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
    }
  } else {
    console.warn('⚠️ Firebase Admin SDK initialized with missing or incomplete credentials during build');
  }
}

const adminDb = getApps().length > 0 ? getFirestore() : ({} as any);
const adminAuth = getApps().length > 0 ? getAuth() : ({} as any);

export { adminDb, adminAuth };