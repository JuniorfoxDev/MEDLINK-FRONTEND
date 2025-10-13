// ✅ Import required Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // optional, only for analytics

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEn-sUoANMkC3vEjtdqaa63nMhhcARb74",
  authDomain: "medlink-c0351.firebaseapp.com",
  projectId: "medlink-c0351",
  storageBucket: "medlink-c0351.appspot.com", // fixed ".app" → should be ".appspot.com"
  messagingSenderId: "32497917983",
  appId: "1:32497917983:web:8140b5eddb7e01f6b5352a",
  measurementId: "G-ZBC6V2D17Y",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // optional

// ✅ Initialize Auth + Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

// ✅ Export default app
export default app;
