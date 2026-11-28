import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

export const FIREBASE_CONFIG = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyCwsHiPK1672Il8PfEETQTeO2iaNcuQN8E',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'setu-e786b.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'setu-e786b',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'setu-e786b.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '739534384401',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:739534384401:web:0e0b71323492c16c1f30b0',
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-7D9NQN5JHR',
};

let firebaseAppInstance: FirebaseApp;
if (getApps().length === 0) {
  firebaseAppInstance = initializeApp(FIREBASE_CONFIG);
} else {
  firebaseAppInstance = getApp();
}

export const firebaseApp = firebaseAppInstance;
export const firebaseAuth: Auth = getAuth(firebaseAppInstance);
