// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACJlN464hqO0cpR26_7cn_prh9h1DB7jk",
  authDomain: "crop-protection-44cdc.firebaseapp.com",
  projectId: "crop-protection-44cdc",
  storageBucket: "crop-protection-44cdc.firebasestorage.app",
  messagingSenderId: "794080731363",
  appId: "1:794080731363:web:5eb6df85ee19b14037a5d6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);