// lib/services/authService.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged  // 이 부분이 있는지 확인!
  } from 'firebase/auth';
  import { auth } from '../firebase';
  
  // Google 로그인 제공자
  const googleProvider = new GoogleAuthProvider();
  
  // 이메일/비밀번호 회원가입
  export const signUpWithEmail = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('회원가입 성공:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  };
  
  // 이메일/비밀번호 로그인
  export const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('로그인 성공:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  };
  
  // Google 로그인
  export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google 로그인 성공:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  };
  
  // 로그아웃
  export const logOut = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };
  
 // 인증 상태 변화 감지
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };

  // 현재 사용자 가져오기
export const getCurrentUser = () => {
    return auth.currentUser;
  };