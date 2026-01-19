import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcWTVjOSKL1mYsLrgeuXmKjItkx9SaIp4",
  authDomain: "salama-5ebcb.firebaseapp.com",
  projectId: "salama-5ebcb",
  storageBucket: "salama-5ebcb.firebasestorage.app",
  messagingSenderId: "468176091132",
  appId: "1:468176091132:web:29c9a1544c96a70f66a479"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
