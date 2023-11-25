import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA747pnkCr7h_crE0GeoE1Uivu5Px1pCHs",
    authDomain: "apetit-f635e.firebaseapp.com",
    projectId: "apetit-f635e",
    storageBucket: "apetit-f635e.appspot.com",
    messagingSenderId: "950318159001",
    appId: "1:950318159001:web:590411f9bd1898a1f81408"
};

export const firebase = initializeApp(firebaseConfig);
export const auth = getAuth(firebase);
export const storage = getStorage(firebase);