import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const omnitoolConfig = {
  apiKey: "AIzaSyCbGBagXeHldZGDX3LlHl8MYyBD8soiL10",
  authDomain: "omnitool-backend-d8ce5.firebaseapp.com",
  databaseURL: "https://omnitool-backend-d8ce5-default-rtdb.firebaseio.com",
  projectId: "omnitool-backend-d8ce5",
  storageBucket: "omnitool-backend-d8ce5.firebasestorage.app",
  messagingSenderId: "433182580251",
  appId: "1:433182580251:web:8c49b079305cef62b6a2be"
};

const omnitoolApp = initializeApp(omnitoolConfig, "omnitool");
export const rtdb = getDatabase(omnitoolApp);
export const omnitoolAuth = getAuth(omnitoolApp);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
