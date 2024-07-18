import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore,doc,setdoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCo1OOCzf2RhK_Dol9eKj67MBweQy4zsMs",
  authDomain: "cove-9068b.firebaseapp.com",
  projectId: "cove-9068b",
  storageBucket: "cove-9068b.appspot.com",
  messagingSenderId: "595516903556",
  appId: "1:595516903556:web:c4a29273ac10fc221572d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, firebaseConfig, storage };
