
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChKZnGqFLgdIaajP3SIQV40R4zR6LY7jg",
  authDomain: "niloatacadista-54052.firebaseapp.com",
  databaseURL: "https://niloatacadista-54052-default-rtdb.firebaseio.com/",
  projectId: "niloatacadista-54052",
  storageBucket: "niloatacadista-54052.appspot.com",
  messagingSenderId: "1080093680253",
  appId: "1:1080093680253:web:2e2ecbb7a8ed26c3e2ec6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = getFirestore(app);

export { database, db };
