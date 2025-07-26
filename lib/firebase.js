// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 설정 디버깅
console.log('Firebase 환경변수 확인:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗'
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 초기화
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('Firebase 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

export { db, auth };
export default app;