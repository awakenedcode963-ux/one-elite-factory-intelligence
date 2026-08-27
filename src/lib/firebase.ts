import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0132745776",
  appId: "1:478379427900:web:f3d95d44b381beea7d9b39",
  apiKey: "AIzaSyB6dFS-ycpCGlFVcXo0A2CELpRaL3hW0DE",
  authDomain: "gen-lang-client-0132745776.firebaseapp.com",
  storageBucket: "gen-lang-client-0132745776.firebasestorage.app",
  messagingSenderId: "478379427900",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the exact database ID from the instructions
export const db = getFirestore(app, "ai-studio-1de9d2ab-1ecb-4419-b476-4cf77700de0c");

export const googleProvider = new GoogleAuthProvider();
// Add required Google Workspace scopes
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/forms.body.readonly');

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
