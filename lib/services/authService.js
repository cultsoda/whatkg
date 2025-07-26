// lib/services/authService.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
  } from 'firebase/auth';
  import { auth } from '../firebase';
  
  // Google 로그인 제공자
  const googleProvider = new GoogleAuthProvider();
  
  // Firebase 에러 코드를 한국어 메시지로 변환
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      // 인증 관련 에러
      'auth/user-not-found': '등록되지 않은 이메일입니다.',
      'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
      'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
      'auth/user-disabled': '비활성화된 계정입니다. 관리자에게 문의하세요.',
      'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
      
      // 회원가입 관련 에러
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
      'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
      'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다.',
      
      // Google 로그인 관련 에러
      'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
      'auth/popup-blocked': '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
      'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
      'auth/account-exists-with-different-credential': '다른 로그인 방법으로 가입된 계정입니다.',
      
      // 네트워크 관련 에러
      'auth/network-request-failed': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
      'auth/timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      
      // 기타 에러
      'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
      'auth/invalid-verification-code': '인증 코드가 올바르지 않습니다.',
      'auth/invalid-verification-id': '인증 ID가 올바르지 않습니다.'
    };
    
    return errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
  };
  
  // 이메일/비밀번호 회원가입
  export const signUpWithEmail = async (email, password, displayName) => {
    try {
      console.log('회원가입 시도:', { email, displayName });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 사용자 프로필 업데이트
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('프로필 업데이트 완료:', displayName);
      }
      
      console.log('회원가입 성공:', user.uid);
      return user;
    } catch (error) {
      console.error('회원가입 오류:', error);
      const errorMessage = getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };
  
  // 이메일/비밀번호 로그인
  export const signInWithEmail = async (email, password) => {
    try {
      console.log('로그인 시도:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('로그인 성공:', user.uid);
      return user;
    } catch (error) {
      console.error('로그인 오류:', error);
      const errorMessage = getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };
  
  // Google 로그인
  export const signInWithGoogle = async () => {
    try {
      console.log('Google 로그인 시도');
      
      // 한국어 설정
      googleProvider.setCustomParameters({
        'hl': 'ko'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google 로그인 성공:', user.uid);
      return user;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      const errorMessage = getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };
  
  // 로그아웃
  export const logOut = async () => {
    try {
      console.log('로그아웃 시도');
      
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw new Error('로그아웃 중 오류가 발생했습니다.');
    }
  };
  
  // 인증 상태 변화 감지
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
      console.log('인증 상태 변화:', user ? user.uid : 'null');
      callback(user);
    });
  };
  
  // 현재 사용자 가져오기
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // 사용자 정보 업데이트
  export const updateUserProfile = async (updates) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      await updateProfile(user, updates);
      console.log('프로필 업데이트 완료:', updates);
      return user;
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw new Error('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };
  
  // 이메일 유효성 검사
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // 비밀번호 유효성 검사
  export const validatePassword = (password) => {
    return password.length >= 6;
  };