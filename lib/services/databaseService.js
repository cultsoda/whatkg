// lib/services/dataService.js
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    writeBatch
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // 컬렉션 이름 상수
  const COLLECTIONS = {
    USERS: 'users',
    FAMILY_MEMBERS: 'familyMembers',
    WEIGHT_RECORDS: 'weightRecords',
    GOALS: 'goals'
  };
  
  // =============================================================================
  // 사용자 관리
  // =============================================================================
  
  // 사용자 프로필 생성
  export const createUserProfile = async (userId, profileData) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userData = {
        email: profileData.email,
        displayName: profileData.displayName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        familyId: null // 가족 그룹 ID (나중에 설정)
      };
      
      await updateDoc(userRef, userData);
      console.log('사용자 프로필 생성 완료:', userId);
      return userData;
    } catch (error) {
      console.error('사용자 프로필 생성 오류:', error);
      throw new Error('사용자 프로필 생성에 실패했습니다.');
    }
  };
  
  // 사용자 프로필 조회
  export const getUserProfile = async (userId) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('사용자 프로필 조회 오류:', error);
      throw new Error('사용자 정보를 불러올 수 없습니다.');
    }
  };
  
  // =============================================================================
  // 가족 구성원 관리
  // =============================================================================
  
  // 가족 구성원 추가
  export const addFamilyMember = async (userId, memberData) => {
    try {
      const memberRef = collection(db, COLLECTIONS.FAMILY_MEMBERS);
      const newMember = {
        userId,
        name: memberData.name,
        relation: memberData.relation, // 'self', 'spouse', 'child', 'parent'
        birthDate: memberData.birthDate,
        gender: memberData.gender,
        targetWeight: memberData.targetWeight || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      };
      
      const docRef = await addDoc(memberRef, newMember);
      console.log('가족 구성원 추가 완료:', docRef.id);
      return { id: docRef.id, ...newMember };
    } catch (error) {
      console.error('가족 구성원 추가 오류:', error);
      throw new Error('가족 구성원 추가에 실패했습니다.');
    }
  };
  
  // 사용자의 가족 구성원 목록 조회
  export const getFamilyMembers = async (userId) => {
    try {
      const membersRef = collection(db, COLLECTIONS.FAMILY_MEMBERS);
      const q = query(
        membersRef,
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('가족 구성원 조회 완료:', members.length);
      return members;
    } catch (error) {
      console.error('가족 구성원 조회 오류:', error);
      throw new Error('가족 구성원 정보를 불러올 수 없습니다.');
    }
  };
  
  // 가족 구성원 정보 업데이트
  export const updateFamilyMember = async (memberId, updates) => {
    try {
      const memberRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(memberRef, updateData);
      console.log('가족 구성원 업데이트 완료:', memberId);
      return updateData;
    } catch (error) {
      console.error('가족 구성원 업데이트 오류:', error);
      throw new Error('가족 구성원 정보 업데이트에 실패했습니다.');
    }
  };
  
  // =============================================================================
  // 몸무게 기록 관리
  // =============================================================================
  
  // 몸무게 기록 추가
  export const addWeightRecord = async (memberId, weightData) => {
    try {
      const recordsRef = collection(db, COLLECTIONS.WEIGHT_RECORDS);
      const newRecord = {
        memberId,
        weight: parseFloat(weightData.weight),
        date: weightData.date ? new Date(weightData.date) : new Date(),
        memo: weightData.memo || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(recordsRef, newRecord);
      console.log('몸무게 기록 추가 완료:', docRef.id);
      return { id: docRef.id, ...newRecord };
    } catch (error) {
      console.error('몸무게 기록 추가 오류:', error);
      throw new Error('몸무게 기록 저장에 실패했습니다.');
    }
  };
  
  // 특정 구성원의 몸무게 기록 조회
  export const getWeightRecords = async (memberId, limitCount = 100) => {
    try {
      const recordsRef = collection(db, COLLECTIONS.WEIGHT_RECORDS);
      const q = query(
        recordsRef,
        where('memberId', '==', memberId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          date: data.date.toDate() // Timestamp를 Date로 변환
        });
      });
      
      console.log('몸무게 기록 조회 완료:', records.length);
      return records;
    } catch (error) {
      console.error('몸무게 기록 조회 오류:', error);
      throw new Error('몸무게 기록을 불러올 수 없습니다.');
    }
  };
  
  // 특정 날짜 범위의 몸무게 기록 조회
  export const getWeightRecordsByDateRange = async (memberId, startDate, endDate) => {
    try {
      const recordsRef = collection(db, COLLECTIONS.WEIGHT_RECORDS);
      const q = query(
        recordsRef,
        where('memberId', '==', memberId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          date: data.date.toDate()
        });
      });
      
      console.log('날짜별 몸무게 기록 조회 완료:', records.length);
      return records;
    } catch (error) {
      console.error('날짜별 몸무게 기록 조회 오류:', error);
      throw new Error('해당 기간의 기록을 불러올 수 없습니다.');
    }
  };
  
  // 최근 몸무게 기록 조회
  export const getLatestWeightRecord = async (memberId) => {
    try {
      const recordsRef = collection(db, COLLECTIONS.WEIGHT_RECORDS);
      const q = query(
        recordsRef,
        where('memberId', '==', memberId),
        orderBy('date', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate()
        };
      }
      
      return null;
    } catch (error) {
      console.error('최근 몸무게 기록 조회 오류:', error);
      throw new Error('최근 기록을 불러올 수 없습니다.');
    }
  };
  
  // 몸무게 기록 업데이트
  export const updateWeightRecord = async (recordId, updates) => {
    try {
      const recordRef = doc(db, COLLECTIONS.WEIGHT_RECORDS, recordId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      if (updates.date) {
        updateData.date = new Date(updates.date);
      }
      
      await updateDoc(recordRef, updateData);
      console.log('몸무게 기록 업데이트 완료:', recordId);
      return updateData;
    } catch (error) {
      console.error('몸무게 기록 업데이트 오류:', error);
      throw new Error('기록 수정에 실패했습니다.');
    }
  };
  
  // 몸무게 기록 삭제
  export const deleteWeightRecord = async (recordId) => {
    try {
      const recordRef = doc(db, COLLECTIONS.WEIGHT_RECORDS, recordId);
      await deleteDoc(recordRef);
      console.log('몸무게 기록 삭제 완료:', recordId);
    } catch (error) {
      console.error('몸무게 기록 삭제 오류:', error);
      throw new Error('기록 삭제에 실패했습니다.');
    }
  };
  
  // =============================================================================
  // 목표 관리
  // =============================================================================
  
  // 목표 설정
  export const setGoal = async (memberId, goalData) => {
    try {
      const goalsRef = collection(db, COLLECTIONS.GOALS);
      const newGoal = {
        memberId,
        targetWeight: parseFloat(goalData.targetWeight),
        targetDate: new Date(goalData.targetDate),
        startWeight: parseFloat(goalData.startWeight),
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // 기존 활성 목표 비활성화
      const existingGoalsQuery = query(
        goalsRef,
        where('memberId', '==', memberId),
        where('isActive', '==', true)
      );
      
      const existingGoals = await getDocs(existingGoalsQuery);
      const batch = writeBatch(db);
      
      // 기존 목표들 비활성화
      existingGoals.forEach((goalDoc) => {
        batch.update(goalDoc.ref, { isActive: false, updatedAt: Timestamp.now() });
      });
      
      // 새 목표 추가
      const newGoalRef = doc(goalsRef);
      batch.set(newGoalRef, newGoal);
      
      await batch.commit();
      console.log('목표 설정 완료:', newGoalRef.id);
      return { id: newGoalRef.id, ...newGoal };
    } catch (error) {
      console.error('목표 설정 오류:', error);
      throw new Error('목표 설정에 실패했습니다.');
    }
  };
  
  // 활성 목표 조회
  export const getActiveGoal = async (memberId) => {
    try {
      const goalsRef = collection(db, COLLECTIONS.GOALS);
      const q = query(
        goalsRef,
        where('memberId', '==', memberId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          targetDate: data.targetDate.toDate()
        };
      }
      
      return null;
    } catch (error) {
      console.error('활성 목표 조회 오류:', error);
      throw new Error('목표 정보를 불러올 수 없습니다.');
    }
  };
  
  // =============================================================================
  // 통계 및 분석
  // =============================================================================
  
  // 몸무게 변화 통계
  export const getWeightStats = async (memberId, days = 30) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const records = await getWeightRecordsByDateRange(memberId, startDate, endDate);
      
      if (records.length === 0) {
        return null;
      }
      
      const weights = records.map(r => r.weight);
      const latest = weights[weights.length - 1];
      const oldest = weights[0];
      const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      
      return {
        latest,
        oldest,
        change: latest - oldest,
        average: Math.round(average * 10) / 10,
        min,
        max,
        recordCount: records.length,
        period: days
      };
    } catch (error) {
      console.error('몸무게 통계 조회 오류:', error);
      throw new Error('통계 정보를 불러올 수 없습니다.');
    }
  };
  
  // 데이터 유효성 검사
  export const validateWeightData = (weight) => {
    const weightNum = parseFloat(weight);
    return !isNaN(weightNum) && weightNum > 0 && weightNum < 1000;
  };
  
  export const validateDate = (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  };