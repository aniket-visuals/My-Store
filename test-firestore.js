import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    const cred = await signInWithEmailAndPassword(auth, "aniketrajcargal123@gmail.com", "password123");
    console.log("Logged in as", cred.user.email);
    console.log("UID:", cred.user.uid);
    const docRef = doc(db, "users", cred.user.uid);
    await setDoc(docRef, { test: 123 }, { merge: true });
    console.log("Written!");
    const snap = await getDoc(docRef);
    console.log("Read:", snap.data());
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
