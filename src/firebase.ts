import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

//Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, //Pulls safely from .env.local
  authDomain: "twitter-clone-api-495419.firebaseapp.com",
  projectId: "twitter-clone-api-495419",
  storageBucket: "twitter-clone-api-495419.firebasestorage.app",
  messagingSenderId: "365829197310",
  appId: "1:365829197310:web:f0fd65d376f336a0c504af"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);