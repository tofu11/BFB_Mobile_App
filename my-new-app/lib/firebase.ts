import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTHKe9GCiHS6kZKNsNF4N_oMNHD34v4CQ",
  authDomain: "one-world-chair.firebaseapp.com",
  projectId: "one-world-chair",
  storageBucket: "one-world-chair.firebasestorage.app",
  messagingSenderId: "960188613404",
  appId: "1:960188613404:web:81157a366404f92aa970d9",
  measurementId: "G-5PJ74W6MN8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
