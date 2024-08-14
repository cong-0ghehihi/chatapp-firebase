import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDi_ORDUw9m9F9bvKkNOSQ9RYWctE0nHTI",
  authDomain: "reactchat-f92f4.firebaseapp.com",
  projectId: "reactchat-f92f4",
  storageBucket: "reactchat-f92f4.appspot.com",
  messagingSenderId: "155902170817",
  appId: "1:155902170817:web:e64d2781f0905820ea6640",
};

const app = initializeApp(firebaseConfig);
console.log("Firebase");

export const auth= getAuth()
export const db= getFirestore()
export const storage= getStorage()
